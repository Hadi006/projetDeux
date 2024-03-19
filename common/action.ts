enum ActionType {
    EDIT = 'edit',
    DELETE = 'delete',
    CHANGE_VISIBILITY = 'change visibility',
    EXPORT = 'export'
}

interface Action {
    type: ActionType;
    target: number;
}

export { Action, ActionType };

