export function generatePublicId(prefix: string = 'APT') {
  // Generate a random 6-digit number
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomNum}`;
}

export const formatTime = (dateObj: Date) => {
  // Extract hours and minutes from the UTC date object
  // We use UTC methods because Prisma stores Time columns as UTC on 1970-01-01
  const hours = dateObj.getUTCHours().toString().padStart(2, '0');
  const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`; // Returns "14:00"
};

export const convertToSLTime = (utcDateString: Date) => {
  return new Date(utcDateString).toLocaleString('en-US', {
    timeZone: 'Asia/Colombo', // 👈 FORCE Sri Lanka Time
    dateStyle: 'full',
    timeStyle: 'medium',
  });
};


export const STATUS_LABELS: Record<string, string> = {
  pending_payament: "Pending Payment",
  completed: "Completed",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
};

export function humanizeStatus(status: string) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];

  // fallback to natural conversion
  const s = status.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}



export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'; // Or empty string ''

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleDateString('en-GB', {
    weekday: 'long', // "Wednesday"
    day: 'numeric',  // "24"
    month: 'short',  // "Dec"
    year: 'numeric', // "2025"
  });
}

// Optional: If you need just the time
export function formatCalendarTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Helper to get future dates matching specific days of the week
// allowedDays: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

// Helper to get future dates matching specific days of the week
// allowedDays: Array of day names e.g., ["Sunday", "Monday"]
// Helper to get future dates matching specific days of the week
export function getFutureDates(allowedDays: string[], count: number = 8): Date[] {
  // 🛑 SAFETY CHECK 1: If no days allowed, return empty immediately
  if (!allowedDays || allowedDays.length === 0) {
    return [];
  }

  const dates: Date[] = [];
  const currentDate = new Date();

  const dayMap: Record<string, number> = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
  };

  // Convert string days to numbers
  const allowedDayNumbers = allowedDays.map(day => {
    const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    return dayMap[normalizedDay];
  }).filter(day => day !== undefined);

  // 🛑 SAFETY CHECK 2: If conversion failed (e.g. typos), return empty
  if (allowedDayNumbers.length === 0) {
    return [];
  }

  // 🛑 SAFETY CHECK 3: Add a loop limit (e.g., look ahead max 365 days)
  let loopSafety = 0;
  const MAX_LOOKAHEAD = 365;

  while (dates.length < count && loopSafety < MAX_LOOKAHEAD) {
    // Check if the current date's day is in the allowed list
    if (allowedDayNumbers.includes(currentDate.getDay())) {
      dates.push(new Date(currentDate));
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    loopSafety++;
  }

  return dates;
}



// Helper to extract unique hospitals from doctor schedules
export function getAvailableHospitals(doctorData: any) {
  if (!doctorData || !doctorData.doctor_schedules) {
    return [];
  }

  const uniqueHospitalsMap = new Map();

  doctorData.doctor_schedules.forEach((schedule: any) => {
    const hospital = schedule.hospitals;
    if (hospital && !uniqueHospitalsMap.has(hospital.hospital_id)) {
      uniqueHospitalsMap.set(hospital.hospital_id, {
        hospital_id: hospital.hospital_id,
        name: hospital.name,
        city: hospital.city,
        address: hospital.address,
        phone: hospital.phone_number,
        public_id: hospital.public_id,
      });
    }
  });

  return Array.from(uniqueHospitalsMap.values());
}


// Helper to combine Date string and Time string into full ISO format with Timezone
export function createDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";

  // 1. Normalize time format (Handle "14.50" -> "14:50")
  const normalizedTime = timeStr.replace('.', ':');

  // 2. Create the Date object
  // dateStr is "YYYY-MM-DD", normalizedTime is "HH:mm"
  // We create a string "YYYY-MM-DDTHH:mm:00"
  const dateTimeString = `${dateStr}T${normalizedTime}:00`;

  const dateObj = new Date(dateTimeString);

  // 3. Handle Timezone Offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  const hours = pad(dateObj.getHours());
  const minutes = pad(dateObj.getMinutes());
  const seconds = '00';
  const milliseconds = '000';

  // Sri Lanka Offset is +05:30
  const offset = '+05:30';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offset}`;
}