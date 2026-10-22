import { BaseVisualizer, Visualizer } from './core';
import { buildSingleValueViewModel, wrapText } from './single-value.transform';

export class SingleValueVisualizer
  extends BaseVisualizer
  implements Visualizer
{
  draw() {
    const renderingElement = document.getElementById(this._id);

    if (!renderingElement || !this._data) {
      return;
    }

    const viewModel = buildSingleValueViewModel(this._data);
    if (viewModel.kind === 'message') {
      this.renderMessage(
        renderingElement,
        viewModel.messageTitle || '',
        viewModel.messageSubtitle
      );
      return;
    }
    const { dataLabel, filterLabel, formattedValue = '' } = viewModel;

    renderingElement.replaceChildren();

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');

    const viewBoxWidth = 220;
    const viewBoxHeight = 120;

    const horizontalPadding = 32;
    const paddingTop = 16;
    const paddingBottom = 16;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    const ariaLabelParts = [
      dataLabel || 'Single value indicator',
      `Value: ${formattedValue}`,
      filterLabel ? `Filters: ${filterLabel}` : '',
    ].filter(Boolean);
    const ariaLabel = ariaLabelParts.join('. ');

    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', ariaLabel);

    const titleNode = document.createElementNS(svgNamespace, 'title');
    titleNode.textContent = dataLabel || 'Single value indicator';
    svg.appendChild(titleNode);

    const descNode = document.createElementNS(svgNamespace, 'desc');
    descNode.textContent = ariaLabel;
    svg.appendChild(descNode);

    const centerX = viewBoxWidth / 2;
    const textGroup = document.createElementNS(svgNamespace, 'g');

    const titleFontSize = 11;
    const filterFontSize = 8;
    const valueFontSize = 30;
    const lineHeightMultiplier = 1.3;

    const innerWidth = viewBoxWidth - horizontalPadding * 2;
    const approxCharWidth = 5;
    const maxCharsPerLine = Math.max(
      10,
      Math.floor(innerWidth / approxCharWidth)
    );

    const wrappedTitle = wrapText(dataLabel || '', maxCharsPerLine, 2);
    const wrappedFilter = wrapText(filterLabel || '', maxCharsPerLine, 2);

    const titleLineCount = wrappedTitle.length || 1;
    const filterLineCount = wrappedFilter.length || 0;

    const titleHeight = titleLineCount * titleFontSize * lineHeightMultiplier;
    const filterHeight =
      filterLineCount * filterFontSize * lineHeightMultiplier;

    const spacingTitleToFilter = filterLineCount > 0 ? 4 : 0;
    const spacingFilterToValue = 8;

    const totalContentHeight =
      titleHeight +
      spacingTitleToFilter +
      filterHeight +
      spacingFilterToValue +
      valueFontSize;

    let startY = (viewBoxHeight - totalContentHeight) / 2;

    if (startY < paddingTop) {
      startY = paddingTop;
    }
    if (startY + totalContentHeight > viewBoxHeight - paddingBottom) {
      startY = viewBoxHeight - paddingBottom - totalContentHeight;
    }

    textGroup.setAttribute('transform', `translate(${centerX}, ${startY})`);

    let currentY = 0;

    const titleText = this.createTextElement(svgNamespace, {
      y: currentY,
      fontSize: titleFontSize,
      fill: '#424242',
      anchor: 'middle',
      fontWeight: '600',
    });

    titleText.setAttribute('fill-opacity', '0.85');

    this.appendWrappedText(
      svgNamespace,
      titleText,
      wrappedTitle,
      lineHeightMultiplier
    );

    currentY += titleHeight + spacingTitleToFilter;

    let filterText: SVGTextElement | undefined;
    if (filterLineCount > 0) {
      filterText = this.createTextElement(svgNamespace, {
        y: currentY,
        fontSize: filterFontSize,
        fill: '#9e9e9e',
        anchor: 'middle',
        fontWeight: '500',
      });

      this.appendWrappedText(
        svgNamespace,
        filterText,
        wrappedFilter,
        lineHeightMultiplier
      );

      currentY += filterHeight + spacingFilterToValue;
    } else {
      currentY += spacingFilterToValue;
    }

    const valueText = this.createTextElement(svgNamespace, {
      y: currentY,
      fontSize: valueFontSize,
      fill: '#1976d2',
      anchor: 'middle',
      fontWeight: '700',
    });

    valueText.textContent = formattedValue;

    textGroup.appendChild(titleText);
    if (filterText) {
      textGroup.appendChild(filterText);
    }
    textGroup.appendChild(valueText);

    svg.appendChild(textGroup);
    renderingElement.appendChild(svg);
  }

  private renderMessage(
    renderingElement: HTMLElement,
    title: string,
    subtitle?: string
  ) {
    renderingElement.replaceChildren();

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 220 120');

    const centerX = 110;
    const centerY = 60;

    const titleText = document.createElementNS(svgNamespace, 'text');
    titleText.setAttribute('x', String(centerX));
    titleText.setAttribute('y', String(centerY - 4));
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '12');
    titleText.setAttribute('fill', '#757575');
    titleText.textContent = title;

    svg.appendChild(titleText);

    if (subtitle) {
      const subText = document.createElementNS(svgNamespace, 'text');
      subText.setAttribute('x', String(centerX));
      subText.setAttribute('y', String(centerY + 14));
      subText.setAttribute('text-anchor', 'middle');
      subText.setAttribute('font-size', '9');
      subText.setAttribute('fill', '#bdbdbd');
      subText.textContent = subtitle;
      svg.appendChild(subText);
    }

    renderingElement.appendChild(svg);
  }

  private createTextElement(
    svgNamespace: string,
    options: {
      y: number;
      fontSize: number;
      fill: string;
      anchor?: 'start' | 'middle' | 'end';
      fontWeight?: string;
    }
  ): SVGTextElement {
    const text = document.createElementNS(
      svgNamespace,
      'text'
    ) as SVGTextElement;

    text.setAttribute('x', '0');
    text.setAttribute('y', String(options.y));
    text.setAttribute('text-anchor', options.anchor ?? 'start');
    text.setAttribute('font-size', String(options.fontSize));
    text.setAttribute('fill', options.fill);
    text.setAttribute('dominant-baseline', 'hanging'); // y = top of the text box

    if (options.fontWeight) {
      text.setAttribute('font-weight', options.fontWeight);
    }

    return text;
  }

  private appendWrappedText(
    svgNamespace: string,
    textNode: SVGTextElement,
    lines: string[],
    lineHeightMultiplier: number
  ) {
    lines.forEach((line, index) => {
      const tspan = document.createElementNS(
        svgNamespace,
        'tspan'
      ) as SVGTSpanElement;
      tspan.setAttribute('x', '0');
      tspan.setAttribute('dy', index === 0 ? '0' : `${lineHeightMultiplier}em`);
      tspan.textContent = line;
      textNode.appendChild(tspan);
    });
  }

  wrapText(text: string, maxChars: number, maxLines = 2): string[] {
    return wrapText(text, maxChars, maxLines);
  }
}
