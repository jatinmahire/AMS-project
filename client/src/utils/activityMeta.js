import {
  UserPlus,
  Pencil,
  Trash2,
  Building2,
  Receipt,
  PackageX,
  AlertTriangle,
  Wallet,
  Clock,
  CalendarCheck,
  Activity,
} from 'lucide-react';

export const ACTION_ICONS = {
  CREATE_WORKER: UserPlus,
  UPDATE_WORKER: Pencil,
  CREATE_CONTRACTOR: Building2,
  UPDATE_CONTRACTOR: Pencil,
  CREATE_SUPERVISOR: UserPlus,
  UPDATE_SUPERVISOR: Pencil,
  CREATE_FINE: Receipt,
  UPDATE_FINE: Pencil,
  DELETE_FINE: Trash2,
  CREATE_DAMAGE: PackageX,
  UPDATE_DAMAGE: Pencil,
  DELETE_DAMAGE: Trash2,
  CREATE_ACCIDENT: AlertTriangle,
  UPDATE_ACCIDENT: Pencil,
  DELETE_ACCIDENT: Trash2,
  CREATE_ADVANCE: Wallet,
  UPDATE_ADVANCE: Pencil,
  DELETE_ADVANCE: Trash2,
  CREATE_OVERTIME: Clock,
  UPDATE_OVERTIME: Pencil,
  DELETE_OVERTIME: Trash2,
  CREATE_ATTENDANCE: CalendarCheck,
  UPDATE_ATTENDANCE: Pencil,
};

export const ACTION_LABELS = {
  CREATE_WORKER: 'Worker Registered',
  UPDATE_WORKER: 'Worker Updated',
  CREATE_CONTRACTOR: 'Contractor Registered',
  UPDATE_CONTRACTOR: 'Contractor Updated',
  CREATE_SUPERVISOR: 'Supervisor Registered',
  UPDATE_SUPERVISOR: 'Supervisor Updated',
  CREATE_FINE: 'Fine Recorded',
  UPDATE_FINE: 'Fine Updated',
  DELETE_FINE: 'Fine Deleted',
  CREATE_DAMAGE: 'Damage/Loss Recorded',
  UPDATE_DAMAGE: 'Damage/Loss Updated',
  DELETE_DAMAGE: 'Damage/Loss Deleted',
  CREATE_ACCIDENT: 'Accident Recorded',
  UPDATE_ACCIDENT: 'Accident Updated',
  DELETE_ACCIDENT: 'Accident Deleted',
  CREATE_ADVANCE: 'Advance Recorded',
  UPDATE_ADVANCE: 'Advance Updated',
  DELETE_ADVANCE: 'Advance Deleted',
  CREATE_OVERTIME: 'Overtime Recorded',
  UPDATE_OVERTIME: 'Overtime Updated',
  DELETE_OVERTIME: 'Overtime Updated',
  CREATE_ATTENDANCE: 'Attendance Marked',
  UPDATE_ATTENDANCE: 'Attendance Updated',
};

const DETAIL_ROUTES = {
  Worker: (id) => `/workers/${id}`,
  Contractor: (id) => `/contractors/${id}`,
  Supervisor: (id) => `/supervisors/${id}`,
  Fine: (id) => `/fines/${id}`,
  Damage: (id) => `/damages/${id}`,
  Accident: (id) => `/accidents/${id}`,
  Advance: (id) => `/advances/${id}`,
  Overtime: (id) => `/overtimes/${id}`,
  Attendance: (id) => `/attendance/${id}`,
};

const LIST_ROUTES = {
  Worker: '/workers',
  Contractor: '/contractors',
  Supervisor: '/supervisors',
  Fine: '/fines',
  Damage: '/damages',
  Accident: '/accidents',
  Advance: '/advances',
  Overtime: '/overtimes',
  Attendance: '/attendance',
};

export function activityIcon(action) {
  return ACTION_ICONS[action] || Activity;
}

export function activityRoute(log) {
  if (log.action?.startsWith('DELETE_')) {
    return LIST_ROUTES[log.entityType] || null;
  }
  const routeFor = DETAIL_ROUTES[log.entityType];
  return routeFor ? routeFor(log.entityId) : null;
}
