import { RideStatus } from '../common/enums';

export const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  [RideStatus.SOLICITADO]: [
    RideStatus.EN_CAMINO,
    RideStatus.CANCELADO_CLIENTE,
    RideStatus.CANCELADO_CONDUCTOR,
  ],
  [RideStatus.EN_CAMINO]: [
    RideStatus.LLEGO,
    RideStatus.CANCELADO_CLIENTE,
    RideStatus.CANCELADO_CONDUCTOR,
  ],
  [RideStatus.LLEGO]: [
    RideStatus.INICIADO,
    RideStatus.CANCELADO_CLIENTE,
    RideStatus.CANCELADO_CONDUCTOR,
  ],
  [RideStatus.INICIADO]: [
    RideStatus.FINALIZADO,
  ],
  [RideStatus.FINALIZADO]: [],
  [RideStatus.CANCELADO_CLIENTE]: [],
  [RideStatus.CANCELADO_CONDUCTOR]: [],
};

export function canTransition(from: RideStatus, to: RideStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}

export class RideStateMachine {
  static isValidTransition(from: RideStatus, to: RideStatus): boolean {
    return canTransition(from, to);
  }
}
