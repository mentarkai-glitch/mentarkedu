import { storeMemory } from '@/lib/ai/memory';
import { callGPT4o } from '@/lib/ai/models/openai';
import { createClient } from '@/lib/supabase/server';

export interface SMSMessage {
  id: string;
  conversationId: string;
  studentId?: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
}

/**
 * Process incoming SMS message
 */
export async function processIncomingSMS(
  phoneNumber: string,
  message: string,
  messageSid: string
): Promise<{ response?: string; success: boolean; error?: string }> {
  try {
    console.log(`📱 Processing SMS from ${phoneNumber}: ${message}`);
    
    // Find student by phone number
    const supabase = await createClient();
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, institute_id')
      .eq('phone_number', phoneNumber)
      .eq('sms_enabled', true)
      .single();

    if (studentError || !student) {
      console.log(`⚠️  No student found for phone number ${phoneNumber}`);
      return {
        success: true,
        response: "Hi! I'm Mentark, your AI mentor. To get started, please ask your teacher to enable SMS for your account. 📚✨"
      };
    }

    // Store the incoming message in database
    const { data: conversation, error: convError } = await supabase
      .from('sms_conversations')
      .select('id')
      .eq('student_id', student.id)
      .eq('phone_number', phoneNumber)
      .single();

    let conversationId: string;
    
    if (convError || !conversation) {
      // Create new conversation
      const { data: newConv, error: newConvError } = await supabase
        .from('sms_conversations')
        .insert({
          student_id: student.id,
          phone_number: phoneNumber,
          twilio_sid: messageSid,
          status: 'active'
        })
        .select('id')
        .single();

      if (newConvError || !newConv) {
        throw new Error('Failed to create SMS conversation');
      }
      
      conversationId = newConv.id;
    } else {
      conversationId = conversation.id;
    }

    // Store incoming message
    const { error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversationId,
        direction: 'inbound',
        message: message,
        twilio_sid: messageSid,
        status: 'received'
      });

    if (msgError) {
      console.error('Error storing SMS message:', msgError);
    }

    // Handle different message types
    const response = await handleStudentMessage(student.id, message, conversationId);

    return {
      success: true,
      response
    };

  } catch (error) {
    console.error('Error processing incoming SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handle different types of student messages
 */
async function handleStudentMessage(
  studentId: string,
  message: string,
  conversationId: string
): Promise<string> {
  const lowerMessage = message.toLowerCase().trim();

  // Daily check-in responses (1-5 scale)
  if (/^[1-5]$/.test(message)) {
    return await handleDailyCheckIn(studentId, parseInt(message), conversationId);
  }

  // Quick responses
  if (lowerMessage.includes('help') || lowerMessage.includes('menu')) {
    return getHelpMenu();
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
    return await getStudentStatus(studentId);
  }

  if (lowerMessage.includes('motivation') || lowerMessage.includes('encourage')) {
    return await getMotivationalMessage(studentId);
  }

  // AI Chat response
  return await handleAIChat(studentId, message, conversationId);
}

/**
 * Handle daily check-in responses
 */
async function handleDailyCheckIn(
  studentId: string,
  rating: number,
  conversationId: string
): Promise<string> {
  try {
    const supabase = await createClient();
    
    // Store check-in in database
    const { error } = await supabase
      .from('daily_checkins')
      .insert({
        student_id: studentId,
        mood_score: rating,
        checkin_date: new Date().toISOString().split('T')[0],
        notes: `SMS check-in: ${rating}/5`
      });

    if (error) {
      console.error('Error storing check-in:', error);
    }

    // Store in memory for AI context
    await storeMemory({
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      student_id: studentId,
      content: `Daily check-in: ${rating}/5 mood score`,
      metadata: {
        type: 'emotion',
        timestamp: new Date().toISOString(),
        session_id: conversationId,
        emotion_score: rating
      }
    });

    // Generate appropriate response
    const responses = {
      1: "😔 I see you're having a tough day. Remember, it's okay to not be okay. Would you like to talk about what's bothering you?",
      2: "😟 I'm here for you. Sometimes days can be challenging. What's one small thing that could make today better?",
      3: "😐 I understand you're feeling neutral today. That's completely normal! Is there anything specific you'd like to work on?",
      4: "😊 Great to hear you're doing well! What's been going right for you today?",
      5: "🌟 Amazing! I love your positive energy! What's making you feel so good today? Share your success! 🎉"
    };

    return responses[rating as keyof typeof responses] || "Thank you for checking in! 📝";
  } catch (error) {
    console.error('Error handling daily check-in:', error);
    return "Thanks for checking in! 📝 I've recorded your response.";
  }
}

/**
 * Handle AI chat messages
 */
async function handleAIChat(
  studentId: string,
  message: string,
  conversationId: string
): Promise<string> {
  try {
    // Build context from previous conversations
    const context = await buildContextFromMemories(studentId, message);
    
    // Generate AI response
    const systemPrompt = `You are Mentark, an AI mentor for students. You're responding via SMS, so keep responses concise (under 160 characters) but helpful. Use emojis appropriately.`;
    
    const fullPrompt = `${systemPrompt}\n\n${context}\n\nStudent message: ${message}`;
    
    const aiResponse = await callGPT4o(fullPrompt, {
      max_tokens: 100,
      temperature: 0.7
    });

    // Store conversation in memory
    await storeMemory({
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      student_id: studentId,
      content: `SMS Chat - Student: ${message} | Mentor: ${aiResponse.content}`,
      metadata: {
        type: 'conversation',
        timestamp: new Date().toISOString(),
        session_id: conversationId
      }
    });

    return aiResponse.content;
  } catch (error) {
    console.error('Error in AI chat:', error);
    return "I'm having trouble processing that right now. Try again in a moment! 🔄";
  }
}

/**
 * Build context from memories for AI responses
 */
async function buildContextFromMemories(studentId: string, currentMessage: string): Promise<string> {
  try {
    const { retrieveMemories } = await import('@/lib/ai/memory');
    const memories = await retrieveMemories(studentId, currentMessage, { topK: 3 });
    
    if (memories.length === 0) {
      return `Student is starting a new conversation via SMS.`;
    }
    
    let context = `Previous SMS conversation context:\n`;
    memories.forEach(memory => {
      context += `- ${memory.content}\n`;
    });
    
    return context;
  } catch (error) {
    console.error('Error building context:', error);
    return '';
  }
}

/**
 * Get help menu for SMS
 */
function getHelpMenu(): string {
  return `📚 Mentark SMS Commands:
• Send 1-5 for daily check-in
• Type "status" for progress
• Type "motivation" for encouragement
• Ask me anything! I'm your AI mentor 📱✨`;
}

/**
 * Get student status/progress
 */
async function getStudentStatus(studentId: string): Promise<string> {
  try {
    const supabase = await createClient();
    
    // Get recent check-ins
    const { data: recentCheckins } = await supabase
      .from('daily_checkins')
      .select('mood_score, checkin_date')
      .eq('student_id', studentId)
      .order('checkin_date', { ascending: false })
      .limit(7);

    if (!recentCheckins || recentCheckins.length === 0) {
      return "📊 No recent data found. Send 1-5 for daily check-in to start tracking!";
    }

    const avgMood = recentCheckins.reduce((sum, checkin) => sum + checkin.mood_score, 0) / recentCheckins.length;
    
    return `📊 Your Recent Progress:
• 7-day avg mood: ${avgMood.toFixed(1)}/5
• Check-ins: ${recentCheckins.length} days
• Keep up the great work! 🌟`;
  } catch (error) {
    console.error('Error getting student status:', error);
    return "📊 Having trouble getting your status. Try again later!";
  }
}

/**
 * Get motivational message
 */
async function getMotivationalMessage(studentId: string): Promise<string> {
  const motivationalMessages = [
    "🌟 You've got this! Every challenge is a chance to grow stronger!",
    "🚀 Success is the sum of small efforts repeated daily. Keep going!",
    "💪 Believe in yourself! You're capable of amazing things!",
    "🎯 Every expert was once a beginner. You're on the right path!",
    "⭐ Your potential is limitless. Dream big and work hard!",
    "🔥 Challenges make you stronger. Embrace the journey!",
    "🌈 After every storm comes a rainbow. Keep pushing forward!",
    "🎪 Life is a circus. Make sure you're the ringmaster of your own show!",
    "🚀 The future belongs to those who believe in their dreams!",
    "💎 You're a diamond in the rough. Keep polishing yourself!"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  
  // Store motivational interaction in memory
  await storeMemory({
    id: `motivation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    student_id: studentId,
    content: `Student requested motivation via SMS`,
    metadata: {
      type: 'conversation',
      timestamp: new Date().toISOString(),
      tags: ['motivation', 'sms']
    }
  });

  return randomMessage;
}

