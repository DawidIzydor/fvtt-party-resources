import ModuleSettings from "./settings.mjs";
import ResourcesApi from "./resources_api.mjs";
import DashboardDirections from "./dashboard_directions.mjs";
import ResourceNotifications from "./resource_notifications.mjs"
import ResourcesDashboard from "./apps/resources_dashboard.mjs"

Hooks.once('init', () => {
  window.pr = {
    version: game.modules.get('fvtt-party-resources').data.version,
    dashboard: new ResourcesDashboard(),
    api: new ResourcesApi(),
    notifications: new ResourceNotifications()
  }

  ModuleSettings.register()
})

Hooks.once('ready', () => {
  if(game.user.isGM && !window.pr.api.get('first-time-startup-notification-shown'))
    first_time_startup_notification()
})

Hooks.on('renderActorDirectory', (app, html, data) => {
  if(!game.user.isGM && !ModuleSettings.get('toggle_actors_button_for_players')) return

  html
    .find(".directory-header")
    .prepend(`<div class="action-buttons flexrow"><button id="btn-dashboard"><i class="fas fa-calculator"> </i> ${game.i18n.localize('FvttPartyResources.Title')}</div>`)
    .promise()
    .done(() => {
      $('#btn-dashboard').on('click', e => window.pr.dashboard.redraw(true))
    })
})

function first_time_startup_notification() {
  let message = game.i18n.format('FvttPartyResources.FirstTimeNotification', {
    anchor: '<a class="guide-me" href="#">Click here</a>',
    version: window.pr.version
  })

  let notification = window.pr.notifications.queue(message)
  notification.find('a.guide-me').on('click', e => {
    e.preventDefault()
    e.stopPropagation()
    DashboardDirections.render()
    setTimeout(() => { window.pr.notifications.clear(notification) }, 2000)
  })

  window.pr.notifications.render()
  window.pr.api.set('first-time-startup-notification-shown', true)
}
