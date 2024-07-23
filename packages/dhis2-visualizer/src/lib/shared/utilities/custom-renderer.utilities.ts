export class CustomRenderer {
  static renderElement(htmlContent: string, id: string, cssStyles?: string) {
    const renderingElement = document.getElementById(id);

    if (renderingElement) {
      renderingElement?.replaceChildren();
      renderingElement.innerHTML = `
          <style>${cssStyles}</style>
          ${htmlContent}
          `;
    }
  }
}
