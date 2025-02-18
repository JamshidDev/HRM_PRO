export class CustomButton {
  constructor(title, icon, emitKey) {
    this.title = title;
    this.tag = 'button';
    this.iconSvg = icon;
    this.emitKey = emitKey || title;
    this.alwaysEnable = true;
  }

  getValue(editor) {
    return 'hello ';
  }

  isActive(editor) {
    return false;
  }

  isDisabled(editor) {
    return false;
  }

  exec(editor, value) {
    if (this.isDisabled(editor)) return;
    editor.emit(this.emitKey);
  }
}
