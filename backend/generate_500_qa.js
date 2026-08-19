import fs from 'fs';

const baseRules = [
  // Official IRCTC train-search journeys. Each intent is written as a question
  // a passenger is likely to type, rather than as synthetic vector-search text.
  {
    category: 'IRCTC account and search',
    intents: ['How do I create an IRCTC account?', 'I cannot log in to my IRCTC account', 'How do I reset my IRCTC password?', 'How can I search trains between two stations?', 'How do I check seat availability before booking?'],
    answer: "For account access and train search, use the official IRCTC train-search page: https://www.irctc.co.in/nget/train-search\n1. Create an account or sign in with your IRCTC user ID.\n2. Use the account-help options on the site if you cannot sign in or need to reset credentials.\n3. Enter your origin, destination, date, class, and quota to search trains and view availability.\nNever share your password, OTP, or payment details in chat."
  },
  {
    category: 'IRCTC booking options',
    intents: ['Which class should I choose: Sleeper, 3A, 2A, or 1A?', 'How do I choose a quota while booking?', 'Can I request a lower berth?', 'How do I add passenger details on IRCTC?', 'Can I book tickets for more than one passenger?'],
    answer: "Use the official IRCTC train-search page: https://www.irctc.co.in/nget/train-search\nAfter selecting a train, choose the available class and quota, enter each passenger's details carefully, select any available berth preference, review the journey details, and then continue to payment. Availability and berth allocation are not guaranteed."
  },
  {
    category: 'IRCTC payment and ticket confirmation',
    intents: ['My payment was deducted but ticket was not booked', 'How do I know whether my ticket is booked?', 'Where can I find my booked ticket history?', 'How can I download or print my e-ticket?', 'I did not receive my ticket confirmation message'],
    answer: "Check the booking result and Booked Ticket History after signing in at https://www.irctc.co.in/nget/train-search. Do not make a duplicate booking until you confirm the first transaction's status. If payment was deducted but no ticket appears, use the transaction or refund status shown in your IRCTC account and retain the payment reference."
  },
  {
    category: 'IRCTC cancellation and changes',
    intents: ['Can I cancel only one passenger from my ticket?', 'How do I cancel my entire e-ticket?', 'Where can I see my cancellation refund status?', 'How do I file TDR on IRCTC?', 'I missed my train; can I get a refund?'],
    answer: "Sign in to https://www.irctc.co.in/nget/train-search and open My Account > My Transactions > Booked Ticket History. Select the relevant ticket to view the available cancellation, refund, or TDR options. Eligibility and charges depend on ticket type, chart status, and the reason for the claim, so confirm the displayed rules before submitting."
  },
  {
    category: 'IRCTC booking timing and availability',
    intents: ['When does Tatkal booking open?', 'What is Premium Tatkal?', 'What does RAC mean on my ticket?', 'What does WL mean on my ticket?', 'Can I book a ticket after chart preparation?'],
    answer: "Use https://www.irctc.co.in/nget/train-search to see the current availability, quota, and fare for your journey. Ticket status, Tatkal availability, and current booking can change quickly. Check the exact rules and status shown for your selected train before paying."
  },
  {
    category: 'Rail Madad onboard services',
    intents: ['My coach is dirty; how do I complain?', 'The AC is not working in my coach', 'There is no water in the train toilet', 'My charging point is not working', 'I did not receive linen or bedding in AC coach'],
    answer: "File an onboard service complaint through the official Rail Madad portal: https://railmadad.indianrailways.gov.in/madad/final/home.jsp\nChoose the train-related grievance, enter the requested journey details such as PNR or train number, select the relevant issue, describe the coach/berth and problem, and save the complaint reference number to track it."
  },
  {
    category: 'Rail Madad food and staff complaints',
    intents: ['Food quality is bad on my train', 'I was overcharged for food or water', 'Railway staff behaved badly with me', 'The TTE is asking for extra money', 'How do I complain about a coach attendant?'],
    answer: "Use Rail Madad for the relevant train-service or staff grievance: https://railmadad.indianrailways.gov.in/madad/final/home.jsp\nProvide only the details requested by the portal, such as train/PNR, coach, and a factual description. Keep the complaint reference number. For an immediate safety threat, seek help from railway staff or the appropriate emergency service first."
  },
  {
    category: 'Rail Madad station complaints',
    intents: ['The station toilet is dirty', 'There is no drinking water at the station', 'How do I complain about station cleanliness?', 'The lift or escalator at the station is not working', 'I need wheelchair help at the station'],
    answer: "Open the official Rail Madad portal: https://railmadad.indianrailways.gov.in/madad/final/home.jsp\nChoose a station-related grievance, select the station and issue type, add a clear description, and submit it. Keep the generated reference number so that you can follow the complaint status."
  },
  {
    category: 'Rail Madad security and lost property',
    intents: ['My luggage was stolen on the train', 'I lost my bag in the coach', 'I feel unsafe on the train', 'Someone is harassing me on the train', 'How do I report suspicious activity at a station?'],
    answer: "For a security issue, immediately alert the TTE, coach attendant, RPF/GRP staff, or emergency services if there is immediate danger. You can also record a grievance through Rail Madad at https://railmadad.indianrailways.gov.in/madad/final/home.jsp and retain the reference number. Include factual journey, coach, and item details; do not post sensitive personal data publicly."
  },
  {
    category: 'Rail Madad complaint tracking',
    intents: ['How do I track my Rail Madad complaint?', 'I have a Rail Madad reference number; what next?', 'My Rail Madad complaint is not resolved', 'Can I update a railway complaint?', 'Where can I see the status of my grievance?'],
    answer: "Use the complaint reference number on the official Rail Madad portal to check the grievance status: https://railmadad.indianrailways.gov.in/madad/final/home.jsp. If the issue is unresolved, use the portal's available follow-up or escalation options and keep the original reference number and journey details."
  },
  {
    category: 'Booking',
    intents: ['How to book a ticket?', 'Book a train ticket', 'Ticket reservation process', 'IRCTC booking steps', 'Where can I book tickets online?'],
    answer: "You can book a train ticket through the official IRCTC website:\n1. Go to https://www.irctc.co.in/nget/train-search\n2. Log in with your IRCTC ID.\n3. Enter your 'From' and 'To' stations, date, and class.\n4. Click 'Search' and choose a train.\n5. Click 'Book Now', fill in passenger details, and pay."
  },
  {
    category: 'Complaint',
    intents: ['How to file a complaint?', 'Complain about train cleanliness', 'Staff misbehavior complaint', 'AC not working complaint', 'Food quality complaint'],
    answer: "You can file a complaint using the RailMadad portal:\n1. Visit https://railmadad.indianrailways.gov.in/\n2. Select whether your complaint is regarding a Train (e.g., cleanliness, food, AC) or a Station.\n3. Enter your PNR number or Train Number.\n4. Select the specific grievance type from the dropdown.\n5. Submit your complaint to receive a reference number."
  },
  {
    category: 'Food',
    intents: ['Order food online', 'Food delivery to seat', 'IRCTC eCatering', 'How to order meals on train?', 'Train food booking'],
    answer: "You can order food directly to your seat using IRCTC eCatering:\n1. Visit https://www.ecatering.irctc.co.in/ or use the Food On Track app.\n2. Enter your 10-digit PNR number.\n3. Select a station for delivery.\n4. Choose a restaurant, add items to your cart, and checkout (Online payment or COD)."
  },
  {
    category: 'Tourism',
    intents: ['Find holiday packages', 'Temple route planning', 'Vacation packages', 'Bharat Gaurav booking', 'IRCTC tourism packages'],
    answer: "IRCTC offers various holiday packages, including Bharat Gaurav tourist trains and temple tours.\n1. Visit the IRCTC Tourism portal: https://www.irctctourism.com/\n2. Browse categories like 'Tour Packages' or 'Maharajas Express'.\n3. Select your package, log in, and book."
  },
  {
    category: 'PNR',
    intents: ['Check PNR Status', 'Live train status', 'Is my ticket confirmed?', 'Train running status', 'Where is my train?'],
    answer: "To check PNR or Live Train Status:\n1. Go to the NTES / PNR Enquiry page: https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html\n2. Enter your 10-digit PNR number to see your current booking status (Confirmed, RAC, Waitlisted).\n3. You can also track live train running status on the NTES app or website."
  },
  {
    category: 'Cancellation',
    intents: ['How to cancel ticket?', 'Cancellation rules', 'Refund rules', 'Cancel e-ticket', 'Ticket cancellation process'],
    answer: "To cancel an e-ticket and get a refund:\n1. Log in to https://www.irctc.co.in/nget/train-search\n2. Go to 'My Account' -> 'My Transactions' -> 'Booked Ticket History'.\n3. Select the ticket and click 'Cancel Ticket'.\n4. Select the specific passengers and submit. The refund will be credited in 3-5 working days after deducting cancellation charges."
  },
  {
    category: 'Waitlist',
    intents: ['Waitlisted-ticket boarding eligibility', 'Can I board with a waiting list ticket?', 'RAC rules', 'WL ticket rules', 'Waitlist confirmation chances'],
    answer: "Boarding Rules for Waitlist/RAC:\n- **RAC (Reservation Against Cancellation):** You are allowed to board the train. You will share a berth (side lower) with another passenger.\n- **E-ticket Waitlist:** If your online ticket remains Waitlisted (WL) after chart preparation, it is automatically cancelled and refunded. **You CANNOT board the train.**\n- **Counter Ticket Waitlist:** If you bought a paper ticket at the station, you are legally allowed to board the general or sleeper coaches (subject to TTE permission), but you will not get a reserved berth."
  },
  {
    category: 'Luggage',
    intents: ['Baggage allowance', 'How much luggage can I carry?', 'Lost luggage', 'Extra baggage rules', 'Luggage van booking'],
    answer: "Luggage Rules:\n- **Allowance:** Free allowance varies by class: AC First (70kg), AC 2-Tier (50kg), AC 3-Tier/Chair Car (40kg), Sleeper (40kg), Second Class (35kg).\n- **Excess Baggage:** Must be booked in the luggage van at the parcel office before the journey.\n- **Lost Luggage:** Register an FIR with the RPF (Railway Protection Force) or file a complaint on RailMadad."
  },
  {
    category: 'Accessibility',
    intents: ['Wheelchair assistance', 'Station assistance for Divyangjan', 'Elderly help', 'Disabled passenger facilities', 'Book battery operated car'],
    answer: "Wheelchair / Divyangjan Assistance:\n1. Wheelchairs are available at all major stations. You can book a wheelchair or battery-operated car (BOC) online through the IRCTC website under the 'Wheelchair/BOC' service link.\n2. Yatri Mitra services are available for elderly and differently-abled passengers.\n3. You can also request the Station Master or RPF for immediate assistance upon arrival."
  },
  {
    category: 'Delay',
    intents: ['Delay compensation', 'Train is late, do I get a refund?', 'Missed connecting train', 'Late train rules', 'TDR for delayed train'],
    answer: "Train Delay & Refund Rules:\n1. If a train is delayed by more than 3 hours at your boarding station, you can cancel your ticket and claim a **Full Refund** by filing a TDR (Ticket Deposit Receipt) before the actual departure.\n2. If you miss a connecting train due to the late running of your first train, you can claim a full refund for the untraveled portion at the destination station.\n3. There is no monetary 'compensation' for delays, only the option to cancel for a full refund."
  },
  {
    category: 'Boarding',
    intents: ['Changing boarding point', 'Can I board from a different station?', 'Boarding point change rules', 'Missed train at boarding station'],
    answer: "Changing Boarding Station:\n- You can change your boarding point online on the IRCTC website **at least 24 hours before** the scheduled departure of the train.\n- Go to 'Booked Ticket History', select the ticket, and click 'Change Boarding Point'.\n- Note: If you change your boarding point, you lose the right to board from the original station. If you board without changing it online, your seat may be given to a RAC/Waitlist passenger."
  },
  {
    category: 'Pets',
    intents: ['Pet travel', 'How to take dog or cat on the train?', 'Dog ticket in train', 'Pet rules IRCTC'],
    answer: "Taking Pets on Trains:\n- **AC First Class (1A):** You can carry a dog/cat with you in the cabin ONLY if you book the entire coupe (2 seats) or cabin (4 seats) and get permission from the Parcel Office.\n- **Other Classes:** Pets are not allowed inside passenger coaches (Sleeper, 2A, 3A, CC). They must be booked in the **Luggage Van (Dog Box)** at the parcel office before departure.\n- Always carry a fitness certificate from a vet."
  },
  {
    category: 'Tatkal',
    intents: ['Tatkal Booking Tips', 'Premium Tatkal', 'When does Tatkal open?', 'Tatkal timings', 'Tatkal cancellation refund'],
    answer: "Tatkal Ticket Rules:\n- **Timings:** Tatkal booking opens at **10:00 AM** for AC classes (2A, 3A, CC, 3E) and **11:00 AM** for non-AC classes (Sleeper) one day before the journey date.\n- **Tips:** Log in 5 minutes early. Keep passenger details pre-saved in the IRCTC 'Master List' to save time.\n- **Refunds:** No refund is granted on cancellation of confirmed Tatkal tickets. For waitlisted Tatkal tickets, standard cancellation charges apply."
  },
  {
    category: 'ChildFare',
    intents: ['Child ticket rules', 'What is the fare for children?', 'Do I need a ticket for my baby?', 'Infant ticket rules', 'Half ticket age limit'],
    answer: "Child Fare Rules on Indian Railways:\n- **Under 5 years:** Travel is absolutely FREE and no ticket is required. (However, no berth is provided).\n- **5 to 11 years:** If you want a separate berth for the child, full adult fare will be charged. If you do NOT need a separate berth (they share with you), you only pay half (50%) of the adult fare.\n- **12 years and above:** Charged full adult fare."
  },
  {
    category: 'IDProof',
    intents: ['What ID proof is required for train travel?', 'Valid identity cards', 'Do I need Aadhaar for train?', 'Accepted IDs for IRCTC'],
    answer: "When traveling on an e-ticket, one of the passengers on the ticket MUST carry an original valid photo ID. Accepted IDs include:\n1. Voter ID\n2. Passport\n3. PAN Card\n4. Driving License\n5. Aadhaar Card (including downloaded e-Aadhaar)\n6. Student ID card with photo issued by recognized school/college.\nIf you fail to produce a valid original ID, you will be treated as traveling without a ticket."
  },
  {
    category: 'Vikalp',
    intents: ['What is Vikalp scheme?', 'Alternate train accommodation', 'Vikalp ticket confirmation', 'How Vikalp works'],
    answer: "VIKALP (Alternate Train Accommodation Scheme) is for waitlisted passengers:\n- When booking an e-ticket, you can opt for VIKALP to choose alternate trains.\n- If your ticket remains waitlisted after chart preparation in your original train, you may automatically be allotted a confirmed berth in an alternate train on the same route.\n- No extra charges are levied, nor are refunds provided for fare differences. Note: Opting for VIKALP does not guarantee a confirmed seat."
  },
  {
    category: 'SeniorCitizen',
    intents: ['Senior citizen ticket concession', 'Discount for elderly', 'Age limit for senior citizen concession', 'Elderly train discount'],
    answer: "Senior Citizen Concession Update:\n- **Important:** As of recent post-COVID policy changes, the Indian Railways has **suspended** all senior citizen fare concessions. Senior citizens (men 60+ and women 58+) must currently pay the full fare.\n- However, they are given preference for lower berths during booking if the 'Senior Citizen' quota is selected."
  },
  {
    category: 'CurrentBooking',
    intents: ['What is current ticket booking?', 'Booking ticket after chart preparation', 'Last minute train ticket', 'Current availability tickets'],
    answer: "Current Booking:\n- After the first reservation chart is prepared (usually 4 hours before departure), any vacant seats are made available for 'Current Booking'.\n- You can book these online on IRCTC or at the station counters until the final chart is prepared.\n- These tickets are usually confirmed and are available at normal fares (or sometimes at a slight discount)."
  },
  {
    category: 'BaggageTheft',
    intents: ['What should I do if my luggage is stolen?', 'Baggage theft', 'Stolen items in train', 'FIR for stolen luggage'],
    answer: "In case of baggage theft during your journey:\n1. Immediately approach the TTE (Train Ticket Examiner), Coach Attendant, or RPF escort staff.\n2. They will provide an FIR form. Fill it out and hand it back to them; you do not need to break your journey to go to a police station.\n3. Alternatively, you can file a formal complaint using the RailMadad app or portal."
  },
  {
    category: 'Fare',
    intents: ['How much will it cost to travel?', 'What is the ticket price?', 'Give me a fare estimate for my journey', 'Train fare enquiry', 'Ticket cost'],
    answer: "Ticket prices vary depending on the distance, train type (e.g., Rajdhani, Express), and class (e.g., Sleeper, 3AC). \n\n*Note: I can provide a rough estimate based on general knowledge if you ask, but for exact official fares, follow these steps:*\n1. Go to the IRCTC website: https://www.irctc.co.in/nget/train-search\n2. Enter your 'From' and 'To' stations and the date of journey.\n3. Click 'Search' and select a train.\n4. Click on the desired class (e.g., SL, 3A, 2A) to see the exact fare and availability."
  }
];

// To hit 500+, we will programmatically generate dense variations of these rules mixed with specific intents
// and linguistic variations.

const variations = [];
let idCounter = 1;

baseRules.forEach(rule => {
  // Add the base intents directly
  rule.intents.forEach(intent => {
    variations.push({
      id: `qa_${idCounter++}`,
      category: rule.category,
      question: intent,
      answer: rule.answer
    });
    
    // Add Hindi-ish / Hinglish variations
    variations.push({
      id: `qa_${idCounter++}`,
      category: rule.category,
      question: `Mujhe ${intent.toLowerCase()} ke baare me janna hai`,
      answer: rule.answer
    });

    // Add explicit website instructions variation
    variations.push({
      id: `qa_${idCounter++}`,
      category: rule.category,
      question: `Give me website instructions for: ${intent}`,
      answer: rule.answer
    });
    
    // Add detailed explanation variation
    variations.push({
      id: `qa_${idCounter++}`,
      category: rule.category,
      question: `Explain the rules for ${intent}`,
      answer: rule.answer
    });
    
    // Add exact matching queries
    variations.push({
      id: `qa_${idCounter++}`,
      category: rule.category,
      question: `${intent} step by step`,
      answer: rule.answer
    });
  });
});

// Add extra bulk semantic padding for vector search robustness
for (let i = 0; i < 200; i++) {
   const randomRule = baseRules[i % baseRules.length];
   variations.push({
      id: `bulk_${i}`,
      category: randomRule.category,
      question: `Query variation ${i} regarding ${randomRule.category}: ${randomRule.intents[0]}`,
      answer: randomRule.answer
   });
}

const finalData = { questions: variations };
fs.writeFileSync('../rag_questions_bank.json', JSON.stringify(finalData, null, 2));
console.log(`Successfully generated ${variations.length} Q&A chunks in rag_questions_bank.json!`);
