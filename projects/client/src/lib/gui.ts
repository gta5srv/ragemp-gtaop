import * as Listeners from '@lib/listeners';
import { EventEmitter } from 'events';

export default class Gui extends EventEmitter implements Listeners.GuiListener {
  accountingBrowser: BrowserMp;

  constructor () {
    super();

    this.accountingBrowser = mp.browsers.new('package://gui/accounting.html');
    this.showChat(false);
  }

  showChat(toggle: boolean) {
    mp.gui.chat.show(toggle);
  }

  showLogin (socialClubName: string, registeredSalt: string) {
    this.accountingBrowser.execute(`showLoginForm('${socialClubName}', '${registeredSalt}');`);
    mp.gui.cursor.show(true, true);
  }

  showRegister (socialClubName: string) {
    this.accountingBrowser.execute(`showRegisterForm('${socialClubName}');`);
    mp.gui.cursor.show(true, true);
  }

  onTryRegister(email: string, hash: string, salt: string): void {
    mp.events.callRemote('OP.tryRegister', email, hash, salt);
  }

  loginResult (success: boolean, message?: string): void {
    this.accountingBrowser.execute(`onLoginResult(${Boolean(success)}, '${message}');`);
  }

  registerResult (success: boolean, message?: string): void {
    this.accountingBrowser.execute(`onRegisterResult(${Boolean(success)}, '${message}');`);
  }

  onGuiDebug (text: string): void {
    mp.gui.chat.push('[BROWSER] ' + text);
  }

  toggleLoginRegister (toggle: boolean): void {
    this.accountingBrowser.execute(`toggleAll(${Boolean(toggle)});`);
    mp.gui.cursor.show(toggle, toggle);
    this.showChat(!toggle);
  }
}
