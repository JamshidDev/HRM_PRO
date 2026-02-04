import mitt from 'mitt'
export const eventBus = mitt()

export const Events = {
  // Task events
  TASK_COMPLETED: 'task.completed',

  COMMAND_GENERATED: 'commands.generated',

  APPLICATION_GENERATED: 'worker.application.generated',

  CERTIFICATED_GENERATED: 'lms.certificate.generated',
  DOCUMENT_COUNT: 'document.counts',
}
