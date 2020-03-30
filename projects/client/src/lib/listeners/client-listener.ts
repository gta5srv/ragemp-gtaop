import Listener from './listener';
import Client from '@lib/client';
import Vehicle from '@lib/vehicle';

interface ClientListener extends Listener<Client> {
  onEnterVehicle(vehicle: Vehicle): void;
  onExitVehicle(lastVehicle: Vehicle): void;
  onBrowserReady(): void;
  // Login
  onTryLogin(hash: string): void;
  onLoginResponse (success: boolean, message?: string): void;
  onConfirmLogin(): void;
  // Register
  onTryRegister(email: string, hash: string, salt: string): void;
  onRegisterResponse(success: boolean, message?: string): void;
  onConfirmRegister(): void;
  // Other accounting stuff
  onForgotPassword(): void;
  onPlayAsGuest(): void;
  onAccountStatusUpdate(socialClubName: string, loggedIn: boolean, registeredSalt?: string): void;
  // Team selection
  onRequestTeamJoin(teamSlug: string): void;
  onTeamJoinResponse(success: boolean, message?: string): void;
  onRequestTeamInfos(): void;
  onTeamInfosResponse(teamInfos: string): void;
}

function isClientListener(listener: Listener<any>): listener is ClientListener {
  return 'onEnterVehicle' in listener;
}

export {
  ClientListener,
  isClientListener
}
