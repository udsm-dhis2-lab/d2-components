import {
  analyticsFixture,
  visualizationConfigFixture,
} from '../../../testing/fixtures/visualizer.fixtures';
import { VisualizationConfiguration } from '../../shared/models/visualization-configuration.model';
import { CustomVisualizer } from './custom-visualizer';

describe('CustomVisualizer current template behavior', () => {
  it('substitutes analytics expressions and installs configured markup and styles', () => {
    document.body.innerHTML = '<div id="custom-host"></div>';
    const config = new VisualizationConfiguration(
      visualizationConfigFixture('CUSTOM', {
        template: {
          html: '<strong data-testid="total">{{dx:dx-a}}</strong>',
          cssStyles: 'strong { color: blue; }',
        },
      })
    );

    new CustomVisualizer()
      .setId('custom-host')
      .setConfig(config)
      .setData(analyticsFixture())
      .draw();

    expect(document.querySelector('[data-testid="total"]')?.textContent).toBe(
      '42.5'
    );
    expect(document.querySelector('#custom-host style')?.textContent).toContain(
      'color: blue'
    );
  });

  it('throws when no template is configured', () => {
    const renderer = new CustomVisualizer().setId('missing-template');

    expect(() => renderer.template).toThrow('Template must be provided');
  });
});
