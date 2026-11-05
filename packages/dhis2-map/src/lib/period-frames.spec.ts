import { buildPeriodFrames } from './period-frames';

const layers = [{id:'thematic-a', periods:['202501','202502']},
  {id:'facility-a', periods:['202501','202502']}];
const periods = [{id:'202502',startDate:'2025-02-01'},
  {id:'202501',startDate:'2025-01-01'}];

describe('period frames', () => {
  it('orders frames by explicit dates and preserves layer identity', () => {
    const input = {mode:'TIMELINE' as const,version:'2.43' as const,periods,layers};
    const frames = buildPeriodFrames(input);
    expect(frames.map(frame=>frame.periodId)).toEqual(['202501','202502']);
    expect(frames[0].layers.map(layer=>layer.id)).toEqual(['thematic-a','facility-a']);
    expect(periods[0].id).toBe('202502');
  });
  it('rejects unsupported Core and mismatched split periods', () => {
    expect(()=>buildPeriodFrames({mode:'TIMELINE',version:'2.41.3',periods,layers})).toThrow('2.43');
    expect(()=>buildPeriodFrames({mode:'SPLIT_BY_PERIOD',version:'2.43',periods,
      layers:[layers[0],{id:'other',periods:['202501']}]})).toThrow('matching periods');
  });
  it('distinguishes absent data from an empty but present frame', () => {
    const frames = buildPeriodFrames({mode:'SINGLE',version:'2.41.3',periods,
      layers:[{id:'thematic-a',periods:['202501']}], missing:{'thematic-a':['202501']}});
    expect(frames[0].layers[0].state).toBe('missing');
    expect(frames[1].layers[0].state).toBe('unavailable');
  });
});
