import axios from 'axios';

const SAMPLE_CHORDPRO = `
{title: 讓我留在你身邊}
{artist: 陳奕迅}
{key: C}

[C]讓我[Am]留在[F]你身[G]邊
[C]就算[Am]只是[F]朋[G]友
`.trim();

describe('POST /api/chordpro/parse', () => {
  it('should parse a valid ChordPro string and return metadata', async () => {
    const res = await axios.post('/api/chordpro/parse', {
      content: SAMPLE_CHORDPRO,
    });

    expect(res.status).toBe(201);
    expect(res.data.title).toBe('讓我留在你身邊');
    expect(res.data.artist).toBe('陳奕迅');
    expect(res.data.key).toBe('C');
  });

  it('should return text and html fields', async () => {
    const res = await axios.post('/api/chordpro/parse', {
      content: SAMPLE_CHORDPRO,
    });
    console.log('Response data:', res.data);

    expect(res.status).toBe(201);
    expect(typeof res.data.text).toBe('string');
    expect(typeof res.data.html).toBe('string');
    expect(res.data.text.length).toBeGreaterThan(0);
    expect(res.data.html).toContain('<div');
  });

  it('should return 400 for missing content', async () => {
    await expect(
      axios.post('/api/chordpro/parse', {})
    ).rejects.toMatchObject({
      response: { status: 400 },
    });
  });
});
