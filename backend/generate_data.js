import fs from 'fs';

const data = {
  questions: [
    // --- EXACT QUICK ACTION CHIPS ---
    {
      id: "qa_1",
      category: "Booking",
      question: "How to book a ticket?",
      answer: "You can book a train ticket through the official IRCTC website:\n1. Go to https://www.irctc.co.in/nget/train-search\n2. Log in with your IRCTC ID.\n3. Enter your 'From' and 'To' stations, date, and class.\n4. Click 'Search' and choose a train.\n5. Click 'Book Now', fill in passenger details, and pay."
    },
    {
      id: "qa_2",
      category: "Complaint",
      question: "How to file a complaint? I want to complain about train cleanliness, staff, or coach.",
      answer: "You can file a complaint using the RailMadad portal:\n1. Visit https://railmadad.indianrailways.gov.in/\n2. Select whether your complaint is regarding a Train (e.g., cleanliness, food, AC) or a Station.\n3. Enter your PNR number or Train Number.\n4. Select the specific grievance type from the dropdown.\n5. Submit your complaint to receive a reference number."
    },
    {
      id: "qa_3",
      category: "Food",
      question: "Order food online. Food delivery to seat. How do I order eCatering?",
      answer: "You can order food directly to your seat using IRCTC eCatering:\n1. Visit https://www.ecatering.irctc.co.in/ or use the Food On Track app.\n2. Enter your 10-digit PNR number.\n3. Select a station for delivery.\n4. Choose a restaurant, add items to your cart, and checkout (Online payment or COD)."
    },
    {
      id: "qa_4",
      category: "Tourism",
      question: "Find holiday packages. Temple route planning. Vacation packages.",
      answer: "IRCTC offers various holiday packages, including Bharat Gaurav tourist trains and temple tours.\n1. Visit the IRCTC Tourism portal: https://www.irctctourism.com/\n2. Browse categories like 'Tour Packages' or 'Maharajas Express'.\n3. Select your package, log in, and book."
    },
    {
      id: "qa_5",
      category: "PNR",
      question: "Check PNR Status. Live train status. Is my ticket confirmed?",
      answer: "To check PNR or Live Train Status:\n1. Go to the NTES / PNR Enquiry page: https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html\n2. Enter your 10-digit PNR number to see your current booking status (Confirmed, RAC, Waitlisted).\n3. You can also track live train running status on the NTES app or website."
    },
    {
      id: "qa_6",
      category: "Cancellation",
      question: "How to cancel ticket? Cancellation and refund rules.",
      answer: "To cancel an e-ticket and get a refund:\n1. Log in to https://www.irctc.co.in/nget/train-search\n2. Go to 'My Account' -> 'My Transactions' -> 'Booked Ticket History'.\n3. Select the ticket and click 'Cancel Ticket'.\n4. Select the specific passengers and submit. The refund will be credited in 3-5 working days after deducting cancellation charges."
    },

    // --- NEW EDGE CASES REQUESTED ---
    {
      id: "edge_1",
      category: "Waitlist",
      question: "Waitlisted-ticket boarding eligibility. Can I board with a waiting list ticket? RAC rules.",
      answer: "Boarding Rules for Waitlist/RAC:\n- **RAC (Reservation Against Cancellation):** You are allowed to board the train. You will share a berth (side lower) with another passenger.\n- **E-ticket Waitlist:** If your online ticket remains Waitlisted (WL) after chart preparation, it is automatically cancelled and refunded. **You CANNOT board the train.**\n- **Counter Ticket Waitlist:** If you bought a paper ticket at the station, you are legally allowed to board the general or sleeper coaches (subject to TTE permission), but you will not get a reserved berth."
    },
    {
      id: "edge_2",
      category: "Luggage",
      question: "Baggage allowance. How much luggage can I carry? Lost luggage.",
      answer: "Luggage Rules:\n- **Allowance:** Free allowance varies by class: AC First (70kg), AC 2-Tier (50kg), AC 3-Tier/Chair Car (40kg), Sleeper (40kg), Second Class (35kg).\n- **Excess Baggage:** Must be booked in the luggage van at the parcel office before the journey.\n- **Lost Luggage:** Register an FIR with the RPF (Railway Protection Force) or file a complaint on RailMadad."
    },
    {
      id: "edge_3",
      category: "Accessibility",
      question: "Wheelchair assistance. Station assistance for Divyangjan. Elderly help.",
      answer: "Wheelchair / Divyangjan Assistance:\n1. Wheelchairs are available at all major stations. You can book a wheelchair or battery-operated car (BOC) online through the IRCTC website under the 'Wheelchair/BOC' service link.\n2. Yatri Mitra services are available for elderly and differently-abled passengers.\n3. You can also request the Station Master or RPF for immediate assistance upon arrival."
    },
    {
      id: "edge_4",
      category: "Delay",
      question: "Delay compensation. Train is late, do I get a refund? Missed connecting train.",
      answer: "Train Delay & Refund Rules:\n1. If a train is delayed by more than 3 hours at your boarding station, you can cancel your ticket and claim a **Full Refund** by filing a TDR (Ticket Deposit Receipt) before the actual departure.\n2. If you miss a connecting train due to the late running of your first train, you can claim a full refund for the untraveled portion at the destination station.\n3. There is no monetary 'compensation' for delays, only the option to cancel for a full refund."
    },
    {
      id: "edge_5",
      category: "Boarding",
      question: "Changing boarding point. Can I board from a different station?",
      answer: "Changing Boarding Station:\n- You can change your boarding point online on the IRCTC website **at least 24 hours before** the scheduled departure of the train.\n- Go to 'Booked Ticket History', select the ticket, and click 'Change Boarding Point'.\n- Note: If you change your boarding point, you lose the right to board from the original station. If you board without changing it online, your seat may be given to a RAC/Waitlist passenger."
    },
    {
      id: "edge_6",
      category: "Pets",
      question: "Pet travel. How to take dog or cat on the train?",
      answer: "Taking Pets on Trains:\n- **AC First Class (1A):** You can carry a dog/cat with you in the cabin ONLY if you book the entire coupe (2 seats) or cabin (4 seats) and get permission from the Parcel Office.\n- **Other Classes:** Pets are not allowed inside passenger coaches (Sleeper, 2A, 3A, CC). They must be booked in the **Luggage Van (Dog Box)** at the parcel office before departure.\n- Always carry a fitness certificate from a vet."
    },
    {
      id: "edge_7",
      category: "Tatkal",
      question: "Tatkal Booking Tips. Premium Tatkal. When does Tatkal open?",
      answer: "Tatkal Ticket Rules:\n- **Timings:** Tatkal booking opens at **10:00 AM** for AC classes (2A, 3A, CC, 3E) and **11:00 AM** for non-AC classes (Sleeper) one day before the journey date.\n- **Tips:** Log in 5 minutes early. Keep passenger details pre-saved in the IRCTC 'Master List' to save time.\n- **Premium Tatkal:** Uses dynamic pricing (fares increase as seats fill up). Normal Tatkal has a fixed extra charge."
    },
    },
    {
      id: "edge_9",
      category: "ChildFare",
      question: "Child ticket rules. What is the fare for children? Do I need a ticket for my baby?",
      answer: "Child Fare Rules on Indian Railways:\n- **Under 5 years:** Travel is absolutely FREE and no ticket is required. (However, no berth is provided).\n- **5 to 11 years:** If you want a separate berth for the child, full adult fare will be charged. If you do NOT need a separate berth (they share with you), you only pay half (50%) of the adult fare.\n- **12 years and above:** Charged full adult fare."
    },
    {
      id: "edge_10",
      category: "IDProof",
      question: "What ID proof is required for train travel? Valid identity cards.",
      answer: "When traveling on an e-ticket, one of the passengers on the ticket MUST carry an original valid photo ID. Accepted IDs include:\n1. Voter ID\n2. Passport\n3. PAN Card\n4. Driving License\n5. Aadhaar Card (including downloaded e-Aadhaar)\n6. Student ID card with photo issued by recognized school/college.\nIf you fail to produce a valid original ID, you will be treated as traveling without a ticket."
    },
    {
      id: "edge_11",
      category: "Vikalp",
      question: "What is Vikalp scheme? Alternate train accommodation.",
      answer: "VIKALP (Alternate Train Accommodation Scheme) is for waitlisted passengers:\n- When booking an e-ticket, you can opt for VIKALP to choose alternate trains.\n- If your ticket remains waitlisted after chart preparation in your original train, you may automatically be allotted a confirmed berth in an alternate train on the same route.\n- No extra charges are levied, nor are refunds provided for fare differences. Note: Opting for VIKALP does not guarantee a confirmed seat."
    },
    {
      id: "edge_12",
      category: "SeniorCitizen",
      question: "Senior citizen ticket concession. Discount for elderly.",
      answer: "Senior Citizen Concession Update:\n- **Important:** As of recent post-COVID policy changes, the Indian Railways has **suspended** all senior citizen fare concessions. Senior citizens (men 60+ and women 58+) must currently pay the full fare.\n- However, they are given preference for lower berths during booking if the 'Senior Citizen' quota is selected."
    },
    {
      id: "edge_13",
      category: "CurrentBooking",
      question: "What is current ticket booking? Booking ticket after chart preparation.",
      answer: "Current Booking:\n- After the first reservation chart is prepared (usually 4 hours before departure), any vacant seats are made available for 'Current Booking'.\n- You can book these online on IRCTC or at the station counters until the final chart is prepared.\n- These tickets are usually confirmed and are available at normal fares (or sometimes at a slight discount)."
    },
    {
      id: "edge_14",
      category: "BaggageTheft",
      question: "What should I do if my luggage is stolen? Baggage theft.",
      answer: "In case of baggage theft during your journey:\n1. Immediately approach the TTE (Train Ticket Examiner), Coach Attendant, or RPF escort staff.\n2. They will provide an FIR form. Fill it out and hand it back to them; you do not need to break your journey to go to a police station.\n3. Alternatively, you can file a formal complaint using the RailMadad app or portal."
    }
  ]
};

// Replicate for semantic stability
const variations = [];
data.questions.forEach((q, index) => {
  variations.push(q);
  variations.push({
    id: `${q.id}_var`,
    category: q.category,
    question: `Help me with ${q.category}. Info on ${q.question}`,
    answer: q.answer
  });
});

const finalData = { questions: variations };
fs.writeFileSync('../rag_questions_bank.json', JSON.stringify(finalData, null, 2));
console.log("rag_questions_bank.json has been generated with edge cases!");
