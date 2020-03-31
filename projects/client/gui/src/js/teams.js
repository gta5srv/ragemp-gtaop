import '@core/loader';

import DOM from '@lib/dom';
import { PopUp } from '@lib/popup';
import { GUI } from '@core/gui/gui';
import $ from 'jquery';


GUI.onReady(function () {
  const teamGUI = GUI.getComponentByName('teams');
  if (!teamGUI) {
    return;
  }

  teamGUI.registerEvent('requestTeamError', (message) => {
    console.log(message);
  });

  const teamSelectionNodes = teamGUI.node.querySelectorAll('.teams-item');

  teamSelectionNodes.forEach((teamSelectionNode) => {
    teamSelectionNode.addEventListener('click', function () {
      this.classList.add('clicked');
    });

    teamSelectionNode.addEventListener('mouseleave', function (e) {
      const parentTeamSelectionNode = DOM.getClosest(e.target, '.teams-item');

      if (parentTeamSelectionNode) {
        parentTeamSelectionNode.classList.remove('clicked');
      }
    });

    const joinButtonNode = teamSelectionNode.querySelector('button.join-team');
    if (joinButtonNode) {
      joinButtonNode.addEventListener('click', function () {
        const parentTeamNode = DOM.getClosest(this, '[data-team-slug]');
        if (!parentTeamNode) {
          return;
        }

        const clickedTeamSlug = parentTeamNode.getAttribute('data-team-slug');
        GUI.callClient('TEAMS.requestJoin', clickedTeamSlug);
      });
    }
  });

  GUI.callClient('TEAMS.requestInfos');
})



window.requestTeamError = (error) => {
  const confirm = new PopUp(`An error occured: "${error}"`);
  confirm.error();
  confirm.button('Retry');
  confirm.show();
}


window.teamsInfosUpdate = (teamsInfos) => {
  for (const teamSlug in teamsInfos) {
    // Save HTML elements
    const $teamElement = $(`[data-team-slug="${teamSlug}"]`);
    const $teamItemElement = $('.teams-item', $teamElement);
    const teamInfos = teamsInfos[teamSlug];

    // Reset classes and texts
    $teamElement.removeClass('teams-item-container-attention');
    $teamElement.removeClass('teams-item-container-disabled');
    $('.teams-info', $teamItemElement).remove();

    let teamInfoText = '';

    // Is disabled
    if (teamInfos.isFull) {
      $teamElement.addClass('teams-item-container-disabled');
      teamInfoText = '<strong>Unavailable</strong> &bull; <i>Too many players</i>';
    }

    // Is recommended
    if (teamInfos.isBoosted) {
      $teamElement.addClass('teams-item-container-attention');
      teamInfoText = '125% XP &bull; Double money';
    }

    // Team info was provided
    if (teamInfoText.length) {
      const $teamInfo =
        $('<div>', { class: 'teams-info' })
          .append($('<p>').html(teamInfoText));

      $teamItemElement.append($teamInfo);
    }
  }
};
