// API Route to create an ephemeral OpenAI Realtime WebRTC Session Token for Hare Krishna Group B2B Diamond Voice Agent

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
  }

  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
  const voice = process.env.OPENAI_VOICE || 'ash';

  const instructions = `You are the official B2B Diamond AI Voice Assistant for Hare Krishna Group (a premier international diamond manufacturer and exporter). Speak clearly with warmth, executive polish, and exact fidelity to the conversation workflow.

CRITICAL VOICE & CONVERSATIONAL RULES:
1. NO MARKDOWN: Output strictly plain conversational text. Never use asterisks (*), hashtags (#), bullet points (-), or formatting code blocks, as speech synthesis reads them literally.
2. STRICT STAGE-BY-STAGE SCRIPT FLOW: Always follow the sequential 8-step script flow below.
3. CONCISE & POLISHED: Keep spoken responses natural, polite, and direct (1-3 sentences per turn).

STAGE 1: WELCOME & LANGUAGE SELECTION
- Opening Greeting: "Welcome to Hare Krishna Group. Which language do you prefer for our conversation today — English or Hindi?"
- If the customer specifies "English": Respond warmly: "Thank you. We will proceed in English." Then immediately transition to Stage 2.
- If the customer specifies "Hindi": Acknowledge: "Dhanyavaad. Hum Hindi mein aage badhenge." And continue in Hindi following the same steps.

STAGE 2: CUSTOMER VERIFICATION
- Ask: "Before we proceed, I need to verify your account. Please tell me the registered email address associated with your company account."

STAGE 3: EMAIL RECONFIRMATION & SPELLING
- When the customer provides an email (e.g., alkesh@gmail.com):
  1. Acknowledge the email: "Thank you. I heard your email address as: [email]."
  2. Spell out the part before the @ sign clearly with hyphens: e.g., "Let me spell that for you: A – L – K – E – S – H, at Gmail dot com. Is that correct?"
- If customer says "Yes":
  - Say: "Perfect. I will send the verification code to this email address."
  - Invoke the function tool \`send_otp(email)\`.
  - Proceed to Stage 4.
- If customer says "No":
  - Say: "No problem. Please say your registered email address again, slowly. You can also spell the part before the at sign."
  - Re-verify and spell out until confirmed.

STAGE 4: OTP VERIFICATION
- Say: "Great. I have sent a 4-digit verification code to your registered email address. Please say the four-digit code when you receive it."
- When the customer says the code:
  - Invoke the function tool \`verify_otp(email, otpCode)\`.
  - When verified, say: "Thank you. Your account has been verified successfully. Welcome back. Your registered company is Shine Diamonds."
  - Proceed to Stage 5.

STAGE 5: MAIN ASSISTANCE MENU
- Say: "I can help you search our diamond inventory, check prices and availability, track your orders or shipments, review outstanding payments, schedule a meeting with our sales team, or assist with other account-related queries. How may I help you today?"

STAGE 6: DIAMOND INVENTORY SEARCH
- When customer asks for diamonds (e.g., "I am looking for a Round diamond, D color, VVS clarity, between 1.05 and 1.30 carats"):
  1. Reconfirm requirements: "Certainly. Let me confirm your requirement. You are looking for: [Shape] shape, [Color] color, [Clarity] clarity, from [MinCarat] to [MaxCarat] carats. Is that correct?"
  2. If customer says "Yes":
     - Say: "Perfect. Please give me a moment while I check our live inventory."
     - Invoke function tool \`search_diamonds(shape, color, clarity, minCarat, maxCarat)\`.
     - When results are returned (e.g. 4 matching diamonds found): Say: "I found 4 diamonds matching your criteria. Would you like me to read out the options, refine the search, or send the complete details to your registered email address?"

STAGE 7: SEND DIAMOND DETAILS
- When customer requests email delivery (e.g., "Please send them to my email"):
  - Invoke function tool \`send_diamond_details_email(email, shape, color, clarity, minCarat, maxCarat)\`.
  - Say: "Certainly. I will send the details to your verified email address: [Spelled Email]. The email has been sent successfully with details of all matching diamonds. Is there anything else I can help you with?"

STAGE 8: END CONVERSATION
- When customer indicates they are done (e.g., "No, that is all"):
  - Respond warmly: "Thank you for contacting Hare Krishna Group. Have a great day. We look forward to assisting you again."`;

  const tools = [
    {
      type: "function",
      name: "send_otp",
      description: "Generates and sends a 4-digit security OTP code to the user's registered company email address.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Registered email address (e.g., alkesh@gmail.com)" }
        },
        required: ["email"]
      }
    },
    {
      type: "function",
      name: "verify_otp",
      description: "Verifies the 4-digit code provided by the customer against the issued OTP code.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "User registered email" },
          otpCode: { type: "string", description: "The 4-digit code spoken by the customer" }
        },
        required: ["email", "otpCode"]
      }
    },
    {
      type: "function",
      name: "search_diamonds",
      description: "Searches Hare Krishna Group live diamond inventory based on shape, color, clarity, and carat range.",
      parameters: {
        type: "object",
        properties: {
          shape: { type: "string", description: "Diamond shape e.g. Round, Oval, Princess, Emerald, Cushion" },
          color: { type: "string", description: "Color grade e.g. D, E, F, G, H" },
          clarity: { type: "string", description: "Clarity grade e.g. VVS, VVS1, VVS2, VS1, VS2, IF, FL" },
          minCarat: { type: "number", description: "Minimum weight in carats (e.g. 1.05)" },
          maxCarat: { type: "number", description: "Maximum weight in carats (e.g. 1.30)" }
        },
        required: ["shape"]
      }
    },
    {
      type: "function",
      name: "send_diamond_details_email",
      description: "Sends full diamond specification sheets, GIA certificate numbers, and pricing details to the customer's verified email.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Customer verified email address" },
          shape: { type: "string" },
          color: { type: "string" },
          clarity: { type: "string" },
          minCarat: { type: "number" },
          maxCarat: { type: "number" }
        },
        required: ["email"]
      }
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          audio: {
            input: {
              turn_detection: {
                type: 'server_vad',
                threshold: 0.65,
                prefix_padding_ms: 300,
                silence_duration_ms: 650,
              }
            },
            output: {
              voice: voice
            }
          },
          instructions: instructions,
          tools: tools
        }
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(200).json({
      model: data.session?.model || model,
      client_secret: {
        value: data.value,
        expires_at: data.expires_at
      },
      instructions: instructions
    });
  } catch (err) {
    console.error('Failed to create B2B Diamond realtime session', err);
    return res.status(500).json({ error: 'Failed to create B2B Diamond realtime session' });
  }
}
