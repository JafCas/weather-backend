import { execSync } from 'child_process';
import request from 'supertest';

const BASE_URL =
  process.env.CLOUD_RUN_URL ||
  'https://weather-service-287683122914.us-central1.run.app';

describe('Weather API (Cloud Run)', () => {
  let idToken: string;

  beforeAll(() => {
    // Fetch a Google Cloud identity token scoped to the Cloud Run service URL.
    // Requires: gcloud auth login  (already done on this machine)
    idToken = execSync(
      `gcloud auth print-identity-token`,
      { encoding: 'utf-8' },
    ).trim();
  });

  it('responds to health check', async () => {
    const res = await request(BASE_URL)
      .get('/health')
      .set('Authorization', `Bearer ${idToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('returns weather data for a valid city', async () => {
    const res = await request(BASE_URL)
      .get('/weather?city=Seattle')
      .set('Authorization', `Bearer ${idToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('temperature');
    expect(res.body).toHaveProperty('humidity');
  });

  it('rejects missing query parameter', async () => {
    const res = await request(BASE_URL)
      .get('/weather')
      .set('Authorization', `Bearer ${idToken}`);
    expect(res.status).toBe(400);
  });
});
