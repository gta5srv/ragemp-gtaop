export default class Gui {
  accountingBrowser: BrowserMp;
  teamsBrowser: BrowserMp|null = null;


  constructor () {
    this.accountingBrowser = mp.browsers.new('package://gui/accounting.html');
    this.showChat(false);
  }


  public showChat(toggle: boolean) {
    mp.gui.chat.show(toggle);
  }


  public showLogin (socialClubName: string, registeredSalt: string) {
    this.accountingBrowser.execute(`showLoginForm('${socialClubName}', '${registeredSalt}');`);
    mp.gui.cursor.show(true, true);
  }


  public showRegister (socialClubName: string) {
    this.accountingBrowser.execute(`showRegisterForm('${socialClubName}');`);
    mp.gui.cursor.show(true, true);
  }


  public onTryRegister(email: string, hash: string, salt: string): void {
    mp.events.callRemote('OP.tryRegister', email, hash, salt);
  }


  public loginResult (success: boolean, message?: string): void {
    this.accountingBrowser.execute(`onLoginResult(${Boolean(success)}, '${message}');`);
  }


  public registerResult (success: boolean, message?: string): void {
    this.accountingBrowser.execute(`onRegisterResult(${Boolean(success)}, '${message}');`);
  }


  public toggleLoginRegister (toggle: boolean): void {
    this.accountingBrowser.execute(`toggleAll(${Boolean(toggle)});`);
    mp.gui.cursor.show(toggle, toggle);
    this.showChat(!toggle);
  }


  public showTeamSelection () {
    this.teamsBrowser = mp.browsers.new('package://gui/teams.html');
    mp.gui.cursor.show(true, true);
    this.showChat(false);
  }


  public hideTeamSelection () {
    if (!this.teamsBrowser) {
      return;
    }

    this.teamsBrowser.destroy();
    this.teamsBrowser = null;

    mp.gui.cursor.show(false, false);
    this.showChat(true);
  }


  public onTeamJoinResponse (success: boolean, message?: string) {
    if (!this.teamsBrowser) {
      return;
    }

    if (!success) {
      this.teamsBrowser.execute(`requestTeamError('${message}');`)
    } else {
      this.hideTeamSelection();
    }
  }
}
