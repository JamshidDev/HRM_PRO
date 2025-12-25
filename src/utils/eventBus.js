
import mitt from 'mitt'

export const eventBus = mitt()


export const Events = {
    // Task events
    TASK_COMPLETED: 'task:completed',

}