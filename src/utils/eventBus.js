
import mitt from 'mitt'
export const eventBus = mitt()

export const Events = {
    // Task events
    TASK_COMPLETED: 'task.completed',
    // Command document events
    COMMAND_GENERATED:'commands.generated',

    APPLICATION_GENERATED:'worker-application.generated',

}