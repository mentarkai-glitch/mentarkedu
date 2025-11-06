/**
 * MSG91 SMS Integration for Indian SMS Services
 */

interface MSG91Config {
  authKey: string;
  senderId: string;
  route: string;
}

interface MSG91Response {
  success: boolean;
  message?: string;
  request_id?: string;
  error?: string;
}

let msg91Config: MSG91Config | null = null;

/**
 * Initialize MSG91 configuration
 */
function getMSG91Config(): MSG91Config {
  if (!msg91Config) {
    if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_SENDER_ID) {
      throw new Error('MSG91_AUTH_KEY and MSG91_SENDER_ID must be set in environment variables');
    }
    
    msg91Config = {
      authKey: process.env.MSG91_AUTH_KEY,
      senderId: process.env.MSG91_SENDER_ID,
      route: process.env.MSG91_ROUTE || '4' // Default to transactional route
    };
  }
  return msg91Config;
}

/**
 * Send SMS message using MSG91
 */
export async function sendSMS(
  to: string,
  message: string,
  options: {
    senderId?: string;
    route?: string;
    country?: string;
  } = {}
): Promise<{ success: boolean; request_id?: string; error?: string }> {
  try {
    const config = getMSG91Config();
    const senderId = options.senderId || config.senderId;
    const route = options.route || config.route;
    const country = options.country || '91'; // Default to India

    // Format phone number for Indian numbers
    const formattedNumber = formatIndianPhoneNumber(to);

    const payload = {
      authkey: config.authKey,
      mobiles: formattedNumber,
      message: message,
      sender: senderId,
      route: route,
      country: country,
      response: 'json'
    };

    const response = await fetch('https://api.msg91.com/api/sendhttp.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString()
    });

    const responseText = await response.text();
    
    // MSG91 returns different response formats
    if (response.ok) {
      // If response is numeric, it's a request ID
      if (/^\d+$/.test(responseText.trim())) {
        const requestId = responseText.trim();
        console.log(`✓ SMS sent to ${formattedNumber}: ${requestId}`);
        return { success: true, request_id: requestId };
      } else {
        // If response contains error message
        console.error('MSG91 Error:', responseText);
        return { success: false, error: responseText };
      }
    } else {
      console.error('MSG91 API Error:', response.status, responseText);
      return { success: false, error: `API Error: ${response.status}` };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send bulk SMS messages using MSG91
 */
export async function sendBulkSMS(
  recipients: Array<{ phone: string; message: string; studentId?: string }>,
  options: {
    senderId?: string;
    route?: string;
    delayBetween?: number; // milliseconds
  } = {}
): Promise<Array<{ phone: string; success: boolean; request_id?: string; error?: string }>> {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message, {
      senderId: options.senderId,
      route: options.route,
    });
    
    results.push({
      phone: recipient.phone,
      success: result.success,
      request_id: result.request_id,
      error: result.error,
    });

    // Add delay between messages to avoid rate limiting
    if (options.delayBetween && options.delayBetween > 0) {
      await new Promise(resolve => setTimeout(resolve, options.delayBetween));
    }
  }

  return results;
}

/**
 * Get message status from MSG91
 */
export async function getMessageStatus(requestId: string): Promise<{ status: string; errorCode?: string }> {
  try {
    const config = getMSG91Config();
    
    const response = await fetch(`https://api.msg91.com/api/status.php?authkey=${config.authKey}&requestid=${requestId}&response=json`);
    const data = await response.json();
    
    return {
      status: data.status || 'unknown',
      errorCode: data.error || undefined,
    };
  } catch (error) {
    console.error('Error getting message status:', error);
    return {
      status: 'unknown',
      errorCode: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format Indian phone number for MSG91
 */
export function formatIndianPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's already 10 digits, add 91 country code
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  
  // If it's 11 digits and starts with 0, remove the 0 and add 91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '91' + cleaned.substring(1);
  }
  
  // If it's 12 digits and starts with 91, return as is
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  
  // If it starts with +91, remove the + and return
  if (phone.startsWith('+91')) {
    return phone.substring(1);
  }
  
  // Default: assume it needs 91 prefix
  return '91' + cleaned;
}

/**
 * Validate Indian phone number format
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
  try {
    const cleaned = phone.replace(/\D/g, '');
    
    // Indian mobile numbers are typically 10 digits
    if (cleaned.length === 10) {
      // Check if it starts with valid Indian mobile prefixes (6,7,8,9)
      if (/^[6-9]/.test(cleaned)) {
        const formatted = formatIndianPhoneNumber(phone);
        return { isValid: true, formatted };
      } else {
        return { isValid: false, error: 'Invalid Indian mobile number format' };
      }
    }
    
    // Handle numbers with country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      const mobilePart = cleaned.substring(2);
      if (/^[6-9]/.test(mobilePart)) {
        return { isValid: true, formatted: cleaned };
      }
    }
    
    // Handle numbers with leading 0
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      const mobilePart = cleaned.substring(1);
      if (/^[6-9]/.test(mobilePart)) {
        const formatted = formatIndianPhoneNumber(phone);
        return { isValid: true, formatted };
      }
    }
    
    return { isValid: false, error: 'Invalid Indian phone number format' };
  } catch (error) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
}

/**
 * Format Indian phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle 10-digit Indian mobile numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Handle 12-digit numbers with country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const mobilePart = cleaned.substring(2);
    return `+91 ${mobilePart.slice(0, 5)} ${mobilePart.slice(5)}`;
  }
  
  return phone;
}
