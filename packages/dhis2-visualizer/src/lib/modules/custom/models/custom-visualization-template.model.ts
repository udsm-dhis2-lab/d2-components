export class CustomVisualizationTemplate {
  constructor(public template: { [key: string]: string }) {}

  get html(): string {
    return this.template ? this.template['html'] : '';
  }

  get cssStyles(): string {
    return this.template ? this.template['cssStyles'] : '';
  }

  get customJs(): string {
    return this.template ? this.template['customJs'] : '';
  }
}
