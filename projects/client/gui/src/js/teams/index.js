import { PopUp } from '../lib/popup';
import $ from 'jquery';


$(function () {
  const $teamContainer = $('.teams-container');
  const $teamSelectionElements = $('.teams-item', $teamContainer);


  $teamSelectionElements.click(function (e) {
    const hadClass = $(this).hasClass('clicked');
    $(this).addClass('clicked');

    if (!hadClass) {
      const $contentExtra = $('.teams-content-extra', $(this));
      const contentExtraHeight = $contentExtra.css('height', 'auto').outerHeight();
      $contentExtra.css('height', '');

      $('.teams-content-extra', $(this))
        .stop()
        .animate({ height: contentExtraHeight, opacity: 1 });
    }
  });


  $('button.join-team', $teamSelectionElements).click(function () {
    const $parentTeamItem = $(this).parents('[data-team-slug]');
    if (!$parentTeamItem.length) {
      return;
    }

    const clickedTeamSlug = $parentTeamItem.attr('data-team-slug');
    console.log('Request join', clickedTeamSlug)
    mp.trigger('OP.GUI.TEAMS.requestJoin', clickedTeamSlug);
  });


  $teamSelectionElements.mouseleave(function (e) {
    const $teamSelectionParent = $(e.target).parents('.teams-item');
    $teamSelectionParent.removeClass('clicked');

    $('.teams-content-extra', $teamSelectionParent)
      .stop()
      .animate({ height: 0, opacity: 0 })
  });


  mp.trigger('OP.GUI.TEAMS.requestInfos');
});


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
