/**
 * Attempts to repair malformed JSON by fixing common issues
 * This is a best-effort repair - may not work for all cases
 */
export function repairJSON(jsonString: string): string {
  let repaired = jsonString.trim();
  
  // Check if milestones exist - if so, we need to preserve them
  const hasMilestones = repaired.includes('"milestones"');
  const milestonesMatch = repaired.match(/"milestones"\s*:\s*\[/);
  const milestonesStart = milestonesMatch ? (milestonesMatch.index || 0) + milestonesMatch[0].length : -1;
  
  // Step 1: Find the last complete structure by tracking depth
  // BUT: Don't stop at first root closing if milestones are present
  let inString = false;
  let escapeNext = false;
  let lastCompleteIndex = -1;
  let braceDepth = 0;
  let bracketDepth = 0;
  let milestonesDepth = 0;
  let inMilestonesArray = false;
  
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    
    // Track when we enter milestones array
    if (milestonesStart > 0 && i >= milestonesStart && !inMilestonesArray) {
      inMilestonesArray = true;
      milestonesDepth = 1; // We're inside the opening [
    }
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    // Track milestones array depth separately
    if (inMilestonesArray) {
      if (char === '[') {
        milestonesDepth++;
      } else if (char === ']') {
        milestonesDepth--;
        if (milestonesDepth === 0) {
          inMilestonesArray = false;
        }
      }
    }
    
    if (char === '{') {
      braceDepth++;
    } else if (char === '}') {
      braceDepth--;
      // Don't stop at root closing if we're in milestones or milestones haven't been reached yet
      if (braceDepth === 0 && bracketDepth === 0) {
        // Only mark as complete if milestones array is closed (or doesn't exist)
        if (!hasMilestones || (milestonesStart > 0 && i > milestonesStart && !inMilestonesArray && milestonesDepth === 0)) {
          lastCompleteIndex = i;
        }
        // If we have milestones but haven't reached them yet, don't stop
        if (hasMilestones && milestonesStart > 0 && i < milestonesStart) {
          lastCompleteIndex = -1; // Clear this, we haven't seen milestones yet
        }
      }
    } else if (char === '[') {
      bracketDepth++;
    } else if (char === ']') {
      bracketDepth--;
      if (braceDepth === 0 && bracketDepth === 0 && !inMilestonesArray) {
        lastCompleteIndex = i;
      }
    }
  }
  
  // Step 2: If we found a complete root structure, truncate there
  // BUT: Only if milestones are not present or are fully included
  if (lastCompleteIndex > 0 && lastCompleteIndex < repaired.length - 1) {
    // Double-check: if milestones exist, make sure we're including them
    if (hasMilestones && milestonesStart > 0) {
      // If we're cutting before milestones, don't cut at all - let it be repaired by closing braces
      if (lastCompleteIndex < milestonesStart) {
        lastCompleteIndex = -1; // Don't truncate here
      }
    }
    
    if (lastCompleteIndex > 0) {
      repaired = repaired.substring(0, lastCompleteIndex + 1);
      // Recalculate depths after truncation
      braceDepth = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
      bracketDepth = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
    }
  }
  
  // Step 3: Find incomplete structures and truncate at last complete element
  if (braceDepth > 0 || bracketDepth > 0) {
    // Find the last complete element in arrays/objects
    let lastCompleteElement = -1;
    let currentDepth = 0;
    inString = false;
    escapeNext = false;
    
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === '{' || char === '[') {
        currentDepth++;
      } else if (char === '}' || char === ']') {
        currentDepth--;
        if (currentDepth === braceDepth + bracketDepth - 1) {
          // Found a complete nested element
          lastCompleteElement = i;
        }
      } else if ((char === ',' || char === '}') && currentDepth === braceDepth + bracketDepth) {
        // Found a complete element separator
        lastCompleteElement = i;
      }
    }
    
    // If we found a last complete element, truncate there
    if (lastCompleteElement > 0 && lastCompleteElement < repaired.length - 1) {
      // Find the next closing bracket/brace after the last complete element
      let truncateAt = lastCompleteElement + 1;
      for (let i = truncateAt; i < repaired.length; i++) {
        if (repaired[i] === '}' || repaired[i] === ']') {
          truncateAt = i + 1;
          break;
        }
        if (repaired[i] === '{' || repaired[i] === '[') {
          break; // Don't truncate if we hit a new structure
        }
      }
      repaired = repaired.substring(0, truncateAt);
    }
  }
  
  // Step 4: Close incomplete structures
  braceDepth = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
  bracketDepth = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
  
  // Close incomplete arrays first, then objects
  while (bracketDepth > 0) {
    repaired += ']';
    bracketDepth--;
  }
  
  while (braceDepth > 0) {
    repaired += '}';
    braceDepth--;
  }
  
  // Step 5: Fix unclosed strings by finding and closing them
  let quoteCount = 0;
  let lastQuotePos = -1;
  inString = false;
  escapeNext = false;
  
  for (let i = 0; i < repaired.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (repaired[i] === '\\') {
      escapeNext = true;
      continue;
    }
    if (repaired[i] === '"') {
      quoteCount++;
      lastQuotePos = i;
      inString = !inString;
    }
  }
  
  // If we have an odd number of quotes, close the last one
  if (quoteCount % 2 !== 0 && lastQuotePos >= 0) {
    // Check if it's safe to add a quote (not in the middle of a property)
    const afterQuote = repaired.substring(lastQuotePos + 1).trim();
    if (!afterQuote.match(/^[,\]\}:]/)) {
      // Find a safe place to close the string
      const safeClosePos = lastQuotePos + 1;
      for (let i = safeClosePos; i < repaired.length; i++) {
        if (repaired[i] === ',' || repaired[i] === '}' || repaired[i] === ']' || repaired[i] === '\n') {
          repaired = repaired.substring(0, i) + '"' + repaired.substring(i);
          break;
        }
      }
      if (safeClosePos === lastQuotePos + 1) {
        repaired += '"';
      }
    }
  }
  
  return repaired;
}

/**
 * Extract partial JSON structure by finding the last complete element
 */
function extractPartialJSON(jsonString: string): string | null {
  // Try to find and extract a valid partial structure
  // Look for the root object opening
  const rootMatch = jsonString.match(/^\{[\s\S]*/);
  if (!rootMatch) return null;
  
  let extracted = '{';
  let depth = 1;
  let inString = false;
  let escapeNext = false;
  let lastValidPos = 0;
  let milestonesStart = -1;
  let milestonesDepth = 0;
  
  // First pass: find where milestones array starts
  const milestonesMatch = jsonString.match(/"milestones"\s*:\s*\[/);
  if (milestonesMatch) {
    milestonesStart = (milestonesMatch.index || 0) + milestonesMatch[0].length;
  }
  
  for (let i = 1; i < jsonString.length; i++) {
    const char = jsonString[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    // Track milestones array depth separately
    if (milestonesStart > 0 && i >= milestonesStart) {
      if (char === '[') milestonesDepth++;
      if (char === ']') milestonesDepth--;
    }
    
    if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;
      // Don't stop at root closing if we're in the middle of milestones array
      if (depth === 0 && milestonesDepth <= 0) {
        lastValidPos = i;
        break;
      }
    }
    
    // Track last valid position (before incomplete structures)
    if ((char === ',' || char === ':' || char === '}' || char === ']') && depth > 0) {
      lastValidPos = i;
    }
  }
  
  if (lastValidPos > 0) {
    extracted = jsonString.substring(0, lastValidPos + 1);
    
    // If we cut off in the middle of milestones, try to close it properly
    if (milestonesStart > 0 && milestonesStart < lastValidPos) {
      // Count open brackets in milestones section
      const milestonesSection = extracted.substring(milestonesStart);
      let openMilestoneBrackets = (milestonesSection.match(/\[/g) || []).length - (milestonesSection.match(/\]/g) || []).length;
      while (openMilestoneBrackets > 0) {
        extracted += ']';
        openMilestoneBrackets--;
      }
    }
    
    // Close any remaining open structures
    let openBraces = (extracted.match(/\{/g) || []).length - (extracted.match(/\}/g) || []).length;
    let openBrackets = (extracted.match(/\[/g) || []).length - (extracted.match(/\]/g) || []).length;
    
    while (openBrackets > 0) {
      extracted += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      extracted += '}';
      openBraces--;
    }
    
    return extracted;
  }
  
  return null;
}

/**
 * Safely parse JSON with repair attempts
 */
export function safeParseJSON(jsonString: string, fallback: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Check if milestones exist - if so, we need to be more careful
    const hasMilestones = jsonString.includes('"milestones"') || jsonString.includes("'milestones'");
    
    // Try to repair and parse again
    try {
      const repaired = repairJSON(jsonString);
      const parsed = JSON.parse(repaired);
      
      // If we have milestones in raw but not in parsed, repair was too aggressive
      if (hasMilestones && (!parsed.milestones || parsed.milestones.length === 0)) {
        console.warn('RepairJSON truncated milestones, trying alternative extraction...');
        throw new Error('Repair truncated milestones');
      }
      
      return parsed;
    } catch (repairError) {
      // If repair fails or truncates milestones, try to extract partial JSON with milestone preservation
      try {
        const partial = extractPartialJSON(jsonString);
        if (partial) {
          const parsed = JSON.parse(partial);
          
          // If we have milestones in raw but not in parsed, extraction was too aggressive
          if (hasMilestones && (!parsed.milestones || parsed.milestones.length === 0)) {
            console.warn('extractPartialJSON truncated milestones, trying manual extraction...');
            throw new Error('Extraction truncated milestones');
          }
          
          return parsed;
        }
      } catch (extractError) {
        // Last resort: try to extract milestones manually and create a valid structure
        try {
          // Try to extract title, description, and milestones
          const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]+)"/);
          const descMatch = jsonString.match(/"description"\s*:\s*"([^"]*)"/);
          const weeksMatch = jsonString.match(/"estimatedCompletionWeeks"\s*:\s*(\d+)/);
          const difficultyMatch = jsonString.match(/"difficultyLevel"\s*:\s*"([^"]+)"/);
          
          // Try to extract milestones array content - use a more comprehensive approach
          // Find the milestones array start
          const milestonesStartMatch = jsonString.match(/"milestones"\s*:\s*\[/);
          if (!milestonesStartMatch) {
            throw new Error('No milestones found in JSON');
          }
          
          const milestonesStart = (milestonesStartMatch.index || 0) + milestonesStartMatch[0].length;
          const milestones: any[] = [];
          
          // Extract the milestones array content by tracking bracket depth
          let bracketDepth = 1; // Start at 1 because we're inside the opening [
          let inString = false;
          let escapeNext = false;
          let milestonesContent = '';
          let i = milestonesStart;
          
          // Find where the milestones array ends
          while (i < jsonString.length && bracketDepth > 0) {
            const char = jsonString[i];
            
            if (escapeNext) {
              milestonesContent += char;
              escapeNext = false;
              i++;
              continue;
            }
            
            if (char === '\\') {
              milestonesContent += char;
              escapeNext = true;
              i++;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
              milestonesContent += char;
              i++;
              continue;
            }
            
            if (inString) {
              milestonesContent += char;
              i++;
              continue;
            }
            
            if (char === '[') {
              bracketDepth++;
              milestonesContent += char;
            } else if (char === ']') {
              bracketDepth--;
              if (bracketDepth > 0) {
                milestonesContent += char;
              }
            } else {
              milestonesContent += char;
            }
            
            i++;
          }
          
          // Now try to parse individual milestone objects from the content
          if (milestonesContent.trim()) {
            // Split by milestone object boundaries (rough heuristic: look for { followed by "order")
            const milestoneObjects: string[] = [];
            let currentObj = '';
            let objDepth = 0;
            let objInString = false;
            let objEscapeNext = false;
            
            for (let j = 0; j < milestonesContent.length; j++) {
              const char = milestonesContent[j];
              
              if (objEscapeNext) {
                currentObj += char;
                objEscapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                currentObj += char;
                objEscapeNext = true;
                continue;
              }
              
              if (char === '"' && !objEscapeNext) {
                objInString = !objInString;
                currentObj += char;
                continue;
              }
              
              if (objInString) {
                currentObj += char;
                continue;
              }
              
              if (char === '{') {
                if (objDepth === 0) {
                  currentObj = '{';
                } else {
                  currentObj += char;
                }
                objDepth++;
              } else if (char === '}') {
                currentObj += char;
                objDepth--;
                if (objDepth === 0) {
                  milestoneObjects.push(currentObj.trim());
                  currentObj = '';
                }
              } else {
                currentObj += char;
              }
            }
            
            // Parse each milestone object
            for (const milestoneStr of milestoneObjects) {
              try {
                const parsed = JSON.parse(milestoneStr);
                milestones.push(parsed);
              } catch (e) {
                // Try to repair this milestone object
                try {
                  const repaired = repairJSON(milestoneStr);
                  const parsed = JSON.parse(repaired);
                  milestones.push(parsed);
                } catch (e2) {
                  // Skip this milestone if it can't be parsed
                  console.warn('Could not parse milestone:', milestoneStr.substring(0, 100));
                  continue;
                }
              }
            }
          }
          
          if (titleMatch) {
            const minimal: any = {
              title: titleMatch[1],
              description: descMatch ? descMatch[1] : '',
              estimatedCompletionWeeks: weeksMatch ? parseInt(weeksMatch[1]) : 4,
              difficultyLevel: difficultyMatch ? difficultyMatch[1] : 'beginner',
              milestones: milestones.length > 0 ? milestones : []
            };
            
            // Only return minimal if we have milestones OR if we have title
            // Don't return empty milestones if we couldn't extract any
            if (milestones.length > 0) {
              console.log(`Extracted ${milestones.length} milestones from incomplete JSON`);
            }
            return minimal;
          }
        } catch (minimalError) {
          // Absolute last resort: return fallback
          console.warn('Failed to parse JSON even after all repair attempts:', extractError);
          return fallback;
        }
      }
    }
  }
  return fallback;
}

