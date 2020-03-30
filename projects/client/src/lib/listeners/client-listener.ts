import Listener from './listener';
import Client from '@lib/client';
import Vehicle from '@lib/vehicle';

interface ClientListener extends Listener<Client> {
  onTryLogin(hash: string): void;
  onLoginResponse (success: boolean, message?: string): void;
  onConfirmLogin(): void;
  onTryRegister(email: string, hash: string, salt: string): void;
  onRegisterResponse(success: boolean, info?: string): void;
  onConfirmRegister(): void;
  onForgotPassword(): void;
  onPlayAsGuest(): void;
  onAccountStatusUpdate(socialClubName: string, loggedIn: boolean, registeredSalt?: string): void;
  onEnterVehicle(vehicle: Vehicle): void;
  onExitVehicle(lastVehicle: Vehicle): void;
  onBrowserReady(): void;
}

function isClientListener(listener: Listener<any>): listener is ClientListener {
  return 'onEnterVehicle' in listener;
}

export {
  ClientListener,
  isClientListener
}
