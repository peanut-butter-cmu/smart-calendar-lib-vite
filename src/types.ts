export type Duration = {
    start: Date; 
    end: Date;
};

export enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3
};

export enum ReminderOptions {
    AT_TIME_EVENT = 0, 
    FIVE_MINUTES = 5,
    TEN_MINUTES = 10,
    FIFTEEN_MINUTES = 15,
    THIRTY_MINUTES = 30,
    ONE_HOUR = 60,
    TWO_HOURS = 120,
    ONE_DAY = 1440, // 24 hours * 60 minutes
    TWO_DAYS = 2880, // 48 hours * 60 minutes
    ONE_WEEK = 10080 // 7 days * 24 hours * 60 minutes
}

export type EventGroup = {
    id: number;
    title: string;
    color: string;
    priority: Priority;
    isBusy: boolean;
    reminders: ReminderOptions[]
};

export type BaseEvent = {
    id: number;
    title: string;
    groups: number[]
};

export type OneTimeEvent = BaseEvent & {
    date: Date;
};

export type RangedEvent = BaseEvent & Duration;
export type CalendarEvent = RangedEvent;
export type EventCreation = Omit<CalendarEvent, "id" | "groups">;
export type EventModification = Partial<Omit<CalendarEvent, "id">>;
export type GroupModification = Partial<Omit<EventGroup, "id">>;

export type EventGroupResp = {
  id: number;
  title: string;
  color: string;
  isBusy: boolean;
  priority: number;
  reminders: string[]; 
  type: string;
}[];


export type CalendarEventResp = {
    id: number;
    title: string;
    start: Date;
    end: Date;
    groups: number[];
}[];

export type User = {
    studentNo: number;
    firstName: string;
    middleName: string;
    lastName: string;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: "system";
  isRead: boolean;
  createdAt: Date;
};

  export type Pagination = {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  
  export type NotificationsResponse = {
    notifications: Notification[];
    pagination: Pagination;
  };

export type FCMTokenPayload = {
  token: string;
  deviceName: string;
};

export type FCMTokenResponse = {
  id: number;
  deviceName: string;
  createdAt: string;
};

export type SharedEventMember = {
  id: number;
  email: string;
  status: "pending"; 
};

export type SharedEventCreation = {
  title: string;
  duration: number;
  reminders: ReminderOptions[];
  idealDays: number[];
  idealTimeRange: {
    startDate: string; // รูปแบบ "YYYY-MM-DD"
    endDate: string;   // รูปแบบ "YYYY-MM-DD"
    dailyStartMin: number;
    dailyEndMin: number;
  };
  invites: string[];
  repeat?: {
    type: "week" |  "month";
    count: number;
  };
};

export type SharedEventMemberResp = {
  firstName: string;
  middleName: string;
  lastName: string;
  sharedEventOwner: boolean;
  events: CalendarEvent[]; // ปรับเปลี่ยนได้ตาม SharedCalendarEvent ที่ API กำหนด
};


export type SharedEventInviteResp = {
  email: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

export type SharedEventRepeat = {
  type: "week" | "month";
  count: number;
};

export type SharedEventResp = {
  id: number;
  title: string;
  status: string;
  duration: number;
  reminders: ReminderOptions[];
  idealDays: number[];
  idealTimeRange: {
    startDate: string; // รูปแบบ "YYYY-MM-DD"
    endDate: string;   // รูปแบบ "YYYY-MM-DD"
    dailyStartMin: number;
    dailyEndMin: number;
  };
  members: SharedEventMemberResp[];
  invites: SharedEventInviteResp[];
  events: CalendarEvent[]; // หรือ SharedCalendarEvent ตามที่เหมาะสม
  repeat?: SharedEventRepeat;
  updatedAt: string;
  createdAt: string;
};

export type SharedEventsResponse = {
  sharedEvents: SharedEventResp[];
  pagination: Pagination;
};




