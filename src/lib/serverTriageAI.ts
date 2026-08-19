/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Display & Cell Pros LLC (D&CP) - Spokane Mobile Electronics Repair Laboratory
 * Triage AI Agent Server Subsystem
 * 
 * Implements Gemini-powered multimodal triage:
 * 1. Multi-turn Active Listening L.E.A.R.N. Chatbot (gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview)
 * 2. High-Thinking Schematic & Circuit Analysis (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
 * 3. Vision Image Understanding for Hardware Cracks & Burns (gemini-3.1-pro-preview)
 * 4. Video Diagnostic Understanding for Flickering & Bootloops (gemini-3.1-pro-preview)
 * 5. Audio Transcription for Voice Intake (gemini-3.5-flash)
 * 6. High-Quality Technical Image & Blueprint Generation (gemini-3-pro-image / gemini-3.1-flash-image)
 * 7. Veo 3 Video Generation for Repair Simulations (veo-3.1-fast-generate-preview)
 * 8. Real-time Parts Inventory & Formulaic Quote Calculator ($50/hr labor + 80% parts markup)
 */

import express from 'express';
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from '@google/genai';

export const triageRouter = express.Router();

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-memory van inventory dataset
export const VAN_INVENTORY = [
  {
    id: 'part_ip11_scr',
    sku: 'MS-IP11-SCR-PRO',
    name: 'iPhone 11 Premium Aftermarket InCell Display Assembly',
    deviceSeries: 'iPhone 11',
    category: 'Screen',
    supplier: 'MobileSentrix',
    costPrice: 17.76,
    standardRetailPrice: 69.99,
    stockVanQuantity: 4,
    warehouseQuantity: 12,
    leadTimeHours: 0
  },
  {
    id: 'part_ip12_scr',
    sku: 'MS-IP12-OLED-SOFT',
    name: 'iPhone 12 / 12 Pro Premium Soft OLED Display Assembly',
    deviceSeries: 'iPhone 12 / 12 Pro',
    category: 'Screen',
    supplier: 'MobileSentrix',
    costPrice: 21.50,
    standardRetailPrice: 79.99,
    stockVanQuantity: 5,
    warehouseQuantity: 16,
    leadTimeHours: 0
  },
  {
    id: 'part_ip13_scr',
    sku: 'MS-IP13-OLED-SOFT-PRO',
    name: 'iPhone 13 Premium Soft OLED Display Assembly',
    deviceSeries: 'iPhone 13',
    category: 'Screen',
    supplier: 'MobileSentrix',
    costPrice: 35.00,
    standardRetailPrice: 104.99,
    stockVanQuantity: 6,
    warehouseQuantity: 20,
    leadTimeHours: 0
  },
  {
    id: 'part_ip13_bat',
    sku: 'AMP-IP13-BAT-OEM',
    name: 'iPhone 13 OEM-Grade Ampsentrix Plus High-Capacity Battery',
    deviceSeries: 'iPhone 13',
    category: 'Battery',
    supplier: 'Ampsentrix Plus',
    costPrice: 18.00,
    standardRetailPrice: 57.40,
    stockVanQuantity: 8,
    warehouseQuantity: 24,
    leadTimeHours: 0
  },
  {
    id: 'part_ip14_scr_oem',
    sku: 'OEM-IP14-DISP-GENUINE',
    name: 'iPhone 14 Genuine Apple OEM Screen Assembly',
    deviceSeries: 'iPhone 14',
    category: 'Screen',
    supplier: 'Genuine OEM',
    costPrice: 277.00,
    standardRetailPrice: 536.10,
    stockVanQuantity: 2,
    warehouseQuantity: 5,
    leadTimeHours: 2
  },
  {
    id: 'part_ip14_bat_oem',
    sku: 'OEM-IP14-BAT-GENUINE',
    name: 'iPhone 14 Genuine OEM Battery Replacement Cell',
    deviceSeries: 'iPhone 14',
    category: 'Battery',
    supplier: 'Genuine OEM',
    costPrice: 52.76,
    standardRetailPrice: 119.99,
    stockVanQuantity: 3,
    warehouseQuantity: 8,
    leadTimeHours: 0
  },
  {
    id: 'part_ip15pm_scr',
    sku: 'MS-IP15PM-OLED-SOFT',
    name: 'iPhone 15 Pro Max Premium Soft OLED Assembly',
    deviceSeries: 'iPhone 15 Pro Max',
    category: 'Screen',
    supplier: 'MobileSentrix',
    costPrice: 58.00,
    standardRetailPrice: 141.90,
    stockVanQuantity: 3,
    warehouseQuantity: 10,
    leadTimeHours: 0
  },
  {
    id: 'part_s24p_scr',
    sku: 'MS-S24P-DISP-PLUS',
    name: 'Samsung Galaxy S24+ Dynamic AMOLED Display Assembly',
    deviceSeries: 'Galaxy S24 Plus',
    category: 'Screen',
    supplier: 'MobileSentrix',
    costPrice: 98.03,
    standardRetailPrice: 213.95,
    stockVanQuantity: 2,
    warehouseQuantity: 6,
    leadTimeHours: 0
  },
  {
    id: 'part_s24u_scr',
    sku: 'OEM-S24U-SERVPACK',
    name: 'Samsung Galaxy S24 Ultra Official Service Pack OLED Screen & Frame',
    deviceSeries: 'Galaxy S24 Ultra',
    category: 'Screen',
    supplier: 'Genuine OEM',
    costPrice: 184.70,
    standardRetailPrice: 369.99,
    stockVanQuantity: 2,
    warehouseQuantity: 4,
    leadTimeHours: 0
  },
  {
    id: 'part_pmic_u3100',
    sku: 'SMD-PMIC-3100',
    name: 'Main PMIC Power Management IC (U3100 / PM8150)',
    deviceSeries: 'Multi-Device Logic Board',
    category: 'IC / SMD Component',
    supplier: 'MobileSentrix',
    costPrice: 15.00,
    standardRetailPrice: 147.00,
    stockVanQuantity: 10,
    warehouseQuantity: 50,
    leadTimeHours: 0
  }
];

export function calculateFormulaPrice(partsCost: number, laborHours: number, zipCode = '99201') {
  const laborRate = 50.0;
  const overheadMarkup = partsCost * 0.8;
  const laborCost = laborHours * laborRate;
  const retailPrice = Number((partsCost + overheadMarkup + laborCost).toFixed(2));
  
  // Tax calculation: Spokane City (3202) = 9.1%, Spokane Valley (3213) = 9.0%
  const isSpokaneValley = ['99206', '99212', '99216'].includes(zipCode);
  const taxRate = isSpokaneValley ? 0.090 : 0.091;
  const taxAmount = Number((retailPrice * taxRate).toFixed(2));
  const totalWithTax = Number((retailPrice + taxAmount).toFixed(2));
  const grossMargin = Number((((retailPrice - partsCost) / retailPrice) * 100).toFixed(1));

  return {
    partsCost,
    laborHours,
    laborCost,
    overheadMarkup,
    retailPrice,
    taxRate,
    taxAmount,
    totalWithTax,
    grossMargin,
    jurisdiction: isSpokaneValley ? 'Spokane Valley (9.0%)' : 'Spokane City (9.1%)'
  };
}

const LEARN_SYSTEM_PROMPT = `
You are the Lead Intake Specialist and Master Triage AI for Display & Cell Pros LLC (D&CP), a premier on-site mobile electronics repair laboratory serving Spokane and Spokane Valley, Washington.
D&CP is owned and operated by Ryan Young, an enrolled Tribal Member and Combat Veteran (UBI: 605 985 265, UEI: VAJXG5MNYQK8, NAICS: 811210).

YOUR OPERATIONAL DIRECTIVES & ACTIVE LISTENING FRAMEWORK (L.E.A.R.N. PROTOCOL):
1. LISTEN & EMPATHIZE (The Digital Nod & Mirroring):
   - Always acknowledge the customer's specific frustration, stress, or urgency first.
   - Mirror their exact non-technical terminology (e.g. "crunchy screen", "spiderwebbed glass", "flickering disco lines", "dead brick", "bleeding ink"). Validate before diagnosing.
2. ASK (Open-Ended Clarification):
   - Ask clarifying diagnostic questions (e.g. "Does the device still vibrate or ping when plugged in?", "Can you see faint icons with a flashlight?").
3. REASSURE (The D&CP Value Proposition):
   - Remind them that D&CP is a fully equipped mobile repair workshop that drives directly to their driveway, office, or coffee shop in Spokane. Zero customer travel or downtime.
4. NAVIGATE & QUOTE (Transparent Right to Repair Pricing):
   - Apply D&CP formulaic pricing: Customer Price = Parts Cost + 80% Markup + ($50/hr Labor).
   - Display replacements: 0.75 hrs ($37.50). Battery refreshes: 0.50 hrs ($25.00). Tier 3 board triage: $49.00 bench trace.
   - Cite compliance with Washington Right to Repair Act (RCW 19.415 / ESHB 1483), ensuring genuine OEM or vetted aftermarket parts from MobileSentrix.

Tone: Professional, empathetic, highly knowledgeable, confident, and direct. Keep answers scannable with clear bullet points.
`;

// 1. Multi-turn Chatbot API Endpoint
triageRouter.post('/chat', async (req, res) => {
  try {
    const { messages = [], model = 'gemini-3.5-flash', deviceDetails, lowLatency = false } = req.body;
    const selectedModel = lowLatency ? 'gemini-3.1-flash-lite' : (model || 'gemini-3.5-flash');

    const gemini = getGemini();
    if (!gemini) {
      // Fallback response if API key is not configured
      return res.json({
        success: true,
        text: `Hello! I'm your D&CP Spokane Triage Specialist. I understand device issues can be stressful. Our mobile repair van comes right to your driveway anywhere in Spokane or Spokane Valley! What symptoms are you noticing with your device?`,
        modelUsed: 'offline-fallback',
        suggestedActions: ['Check iPhone 13 Screen Quote', 'Schedule Van Dispatch', 'Inspect Logic Board']
      });
    }

    const formattedHistory = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    // System prompt with device context if available
    let dynamicPrompt = LEARN_SYSTEM_PROMPT;
    if (deviceDetails?.model) {
      dynamicPrompt += `\nCURRENT INTAKE TARGET: Model: ${deviceDetails.model}, Reported Issue: ${deviceDetails.issue || 'Pending details'}, Tier: ${deviceDetails.tier || 'Standard'}.`;
    }

    const chat = gemini.chats.create({
      model: selectedModel,
      config: {
        systemInstruction: dynamicPrompt,
      }
    });

    const lastMessage = messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || 'Hello, I need help with my device.';
    const response = await chat.sendMessage({ message: lastMessage });

    const replyText = response.text || "I'm reviewing your device specifications. How can our mobile lab assist you today?";

    // Detect if pricing quote is requested
    let quoteEstimate = undefined;
    const lowerText = lastMessage.toLowerCase();
    if (lowerText.includes('price') || lowerText.includes('how much') || lowerText.includes('cost') || lowerText.includes('quote')) {
      let matchedPart = VAN_INVENTORY.find(p => lowerText.includes(p.deviceSeries.toLowerCase()));
      if (!matchedPart) matchedPart = VAN_INVENTORY[2]; // Default to iPhone 13
      const calc = calculateFormulaPrice(matchedPart.costPrice, matchedPart.category === 'Screen' ? 0.75 : 0.5);
      quoteEstimate = {
        deviceModel: matchedPart.deviceSeries,
        repairType: matchedPart.name,
        serviceTier: matchedPart.category === 'Screen' ? 'Tier 2 (Display Renewal)' : 'Tier 1 (Power/Port)',
        partsCost: calc.partsCost,
        laborHours: calc.laborHours,
        laborCost: calc.laborCost,
        overheadMarkup: calc.overheadMarkup,
        retailPrice: calc.retailPrice,
        salesTaxSpokane: calc.taxAmount,
        salesTaxSpokaneValley: Number((calc.retailPrice * 0.090).toFixed(2)),
        totalWithTax: calc.totalWithTax,
        marginPercent: calc.grossMargin,
        inStock: matchedPart.stockVanQuantity > 0,
        warrantyMonths: 12,
        onSiteMobileService: true
      };
    }

    res.json({
      success: true,
      text: replyText,
      modelUsed: selectedModel,
      quote: quoteEstimate,
      suggestedActions: [
        'Confirm Parts in Van Stock',
        'Calculate Spokane vs Spokane Valley Tax',
        'Run Deep Circuit Schematic Trace',
        'Upload Photo for Visual Inspection'
      ]
    });
  } catch (error: any) {
    console.error('Triage Chat Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Chat triage encountered an issue.' });
  }
});

// 2. Deep Thinking Diagnostic Reasoning API
triageRouter.post('/thinking', async (req, res) => {
  try {
    const { query, deviceModel = 'iPhone 13 Pro', telemetry, symptoms = [] } = req.body;
    const gemini = getGemini();

    const prompt = `
You are the Senior Micro-Soldering Architect and Chief Circuit Diagnostic Engineer at Display & Cell Pros LLC (D&CP).
Execute deep step-by-step schematic reasoning and physics calculations for a ${deviceModel}.

DIAGNOSTIC TARGET DATA:
- User Query / Failure Mode: "${query || 'Intermittent bootloop and suspected logic board short'}"
- Symptoms: ${symptoms.join(', ') || 'No display, ammeter spikes to 4.8A on bench DC power supply'}
- Telemetry: Ammeter Current: ${telemetry?.ammeterDrawAmps ?? 4.8}A, Short to GND: ${telemetry?.isShortToGround ? 'TRUE' : 'TRUE'}, Battery Temp: ${telemetry?.batteryTempCelsius ?? 32}°C.

MANDATORY OUTPUT REQUIREMENTS:
1. Voltage Rail Calculations: Evaluate Ohm's Law (R_rail = V / I) assuming nominal 4.2V VDD_MAIN. Calculate expected resistance drop.
2. Step-by-Step Schematic Trace & Rosin / Thermal Camera Hotspot Isolation.
3. IPC-A-610 Micro-Soldering Roadmap with exact hot air temperatures (°C), nozzle airflow, and ESD grounding precautions.
4. Washington Right to Repair (RCW 19.415) legal transparency disclosure.

Return a detailed, highly technical diagnostic synthesis.
`;

    if (!gemini) {
      return res.json({
        success: true,
        thinkingSummary: `Deep Thinking Analysis (Offline Simulation):\n- Primary Finding: VDD_MAIN Short to GND (0.02Ω detected via Ohm's Law on 4.2V rail)\n- Faulty Component: Decoupling MLCC Ceramic Filter Capacitor C3214 on PMIC Sub-rail\n- Recommended Procedure: JBC Hot Air Rework at 380°C with 45L/min airflow to replace C3214.`,
        modelUsed: 'offline-mode'
      });
    }

    const response = await gemini.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    res.json({
      success: true,
      thinkingSummary: response.text,
      modelUsed: 'gemini-3.1-pro-preview (ThinkingLevel.HIGH)'
    });
  } catch (error: any) {
    console.error('Triage Thinking Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Thinking analysis failed.' });
  }
});

// 3. Vision Image Analysis for Hardware Cracks, Burnt ICs & Corrosion
triageRouter.post('/vision', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Analyze this device photo for broken glass, OLED pixel bleed, water corrosion, or burnt board components.', deviceModel = 'Client Device' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image data is required.' });
    }

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        analysis: `### Visual Inspection Analysis\n**Device:** ${deviceModel}\n**Observations:** Visible fracture pattern detected along top right glass perimeter. OLED panel underneath shows no active purple bleed.\n**Recommended Tier:** Tier 2 (Display Renewal Assembly)\n**Compliance:** Non-destructive visual scan under WA RCW 19.415.`,
        modelUsed: 'offline-mode'
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await gemini.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          {
            text: `You are the Optical and Visual Hardware Inspection AI for Display & Cell Pros LLC (D&CP). 
Analyze this hardware photograph for:
1. Glass fracture severity and digitizer grid integrity.
2. OLED matrix status (lines, ink bleeding, dead pixels, backlight separation).
3. Frame chassis denting, corner shock impact, or water indicator sticker color.
4. Recommend the exact service tier (Tier 1 Power/Port, Tier 2 Display Renewal, or Tier 3 Micro-Soldering).
5. User notes: ${prompt}`
          }
        ]
      }
    });

    res.json({
      success: true,
      analysis: response.text,
      modelUsed: 'gemini-3.1-pro-preview'
    });
  } catch (error: any) {
    console.error('Triage Vision Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Vision analysis failed.' });
  }
});

// 4. Video Analysis for Flickering Displays & Boot Loops
triageRouter.post('/video-analysis', async (req, res) => {
  try {
    const { videoBase64, mimeType = 'video/mp4', prompt = 'Analyze this video clip for display strobe patterns, bootloop cycles, or intermittent touch response.' } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ success: false, error: 'Video data is required.' });
    }

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        analysis: `### Video Triage Report\n**Observed Pattern:** Screen exhibits 60Hz flicker followed by Apple logo reboot every 18 seconds.\n**Diagnostic Classification:** Panic log kernel crash or Tristar/Hydra USB communication timeout.\n**Suggested Action:** Connect DC bench ammeter to observe baseline current loop.`,
        modelUsed: 'offline-mode'
      });
    }

    const cleanBase64 = videoBase64.replace(/^data:video\/\w+;base64,/, '');

    const response = await gemini.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          {
            text: `Analyze this recorded hardware behavior video. Identify flicker rate, bootloop sequence timing, or mechanical connector looseness. Provide a step-by-step diagnostic breakdown. Context: ${prompt}`
          }
        ]
      }
    });

    res.json({
      success: true,
      analysis: response.text,
      modelUsed: 'gemini-3.1-pro-preview'
    });
  } catch (error: any) {
    console.error('Triage Video Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Video analysis failed.' });
  }
});

// 5. Audio Transcription for Voice Intake
triageRouter.post('/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Audio data is required.' });
    }

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        transcription: 'My iPhone 13 screen fell on the asphalt and the glass is cracked but I can still hear notifications.',
        extractedDetails: {
          deviceModel: 'iPhone 13',
          suspectedFault: 'Cracked Glass / Display Assembly',
          recommendedTier: 'Tier 2 (Display Renewal)'
        },
        modelUsed: 'offline-mode'
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          {
            text: `Transcribe this customer voice message accurately. Extract the device make/model, the key symptom, any emotional urgency indicators, and suggest the appropriate repair classification.`
          }
        ]
      }
    });

    res.json({
      success: true,
      transcription: response.text,
      modelUsed: 'gemini-3.5-flash'
    });
  } catch (error: any) {
    console.error('Triage Transcribe Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Audio transcription failed.' });
  }
});

// 6. High-Quality Technical Image & Blueprint Generation
triageRouter.post('/generate-image', async (req, res) => {
  try {
    const { 
      prompt = 'Technical schematic blueprint of mobile motherboard circuit showing VDD_MAIN power rail and micro-soldering rework points, clean modern vector engineering style', 
      aspectRatio = '16:9', 
      imageSize = '1K' 
    } = req.body;

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        imageUrl: '/assets/images/regenerated_image_1786855284519.jpg',
        aspectRatio,
        imageSize,
        modelUsed: 'offline-preview'
      });
    }

    const response = await gemini.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            text: `${prompt}. Professional technical illustration, high clarity, clean line art.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || '16:9',
          imageSize: (imageSize as any) || '1K'
        }
      }
    });

    let generatedImageUrl = '';
    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImageUrl) {
      return res.json({
        success: true,
        imageUrl: '/assets/images/regenerated_image_1786855284519.jpg',
        aspectRatio,
        imageSize,
        note: 'Sample preview rendered'
      });
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      aspectRatio,
      imageSize,
      modelUsed: 'gemini-3.1-flash-image'
    });
  } catch (error: any) {
    console.error('Triage Image Generation Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image generation failed.' });
  }
});

// 7. Video Generation via Veo (veo-3.1-fast-generate-preview)
triageRouter.post('/generate-video', async (req, res) => {
  try {
    const { prompt = 'Microscope view of precision micro-soldering repair on smartphone circuit board with smoke plume and glowing solder melt', aspectRatio = '16:9' } = req.body;

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        operationName: 'models/veo-3.1-fast-generate-preview/operations/mock-sim-123',
        status: 'simulated'
      });
    }

    const operation = await gemini.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `${prompt}, cinematic 4k repair laboratory cinematography`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
      }
    });

    res.json({
      success: true,
      operationName: operation.name
    });
  } catch (error: any) {
    console.error('Triage Video Generation Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Video generation failed.' });
  }
});

// 8. Video Generation Status Polling
triageRouter.post('/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'Operation name is required.' });
    }

    const gemini = getGemini();
    if (!gemini || operationName.includes('mock-sim')) {
      return res.json({
        success: true,
        done: true,
        simulated: true,
        videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await gemini.operations.getVideosOperation({ operation: op });

    res.json({
      success: true,
      done: updated.done,
      videoUri: updated.response?.generatedVideos?.[0]?.video?.uri || null
    });
  } catch (error: any) {
    console.error('Video Status Polling Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Status polling failed.' });
  }
});

// 9. Parts Inventory Catalog Endpoint
triageRouter.get('/inventory', (_req, res) => {
  res.json({
    success: true,
    vanInventory: VAN_INVENTORY,
    mobileLabStatus: {
      location: 'Spokane Mobile Lab Van 01',
      serviceRadiusMiles: 35,
      technicianOnDuty: 'Ryan Young (Lead Combat Veteran Tech)',
      rapidDispatchAvailable: true,
      timestamp: new Date().toISOString()
    }
  });
});

// 10. Formulaic Quote Calculation Endpoint
triageRouter.post('/quote-calc', (req, res) => {
  try {
    const { partsCost = 35.0, laborHours = 0.75, zipCode = '99201', deviceModel = 'iPhone 13' } = req.body;
    const calculation = calculateFormulaPrice(Number(partsCost), Number(laborHours), String(zipCode));
    
    res.json({
      success: true,
      deviceModel,
      calculation,
      statutoryDisclosure: {
        law: 'Washington Right to Repair Act (RCW 19.415 / ESHB 1483)',
        rightsStatement: 'D&CP LLC is an independent service provider utilizing genuine OEM or vetted aftermarket parts from MobileSentrix. Customer data is protected and backed up prior to service.'
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Quote calculation failed.' });
  }
});
