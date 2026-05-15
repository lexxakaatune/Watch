import { uploadAPI } from './upload';

export async function testUpload() {
  try {
    const res = await uploadAPI.getUploadUrl({
      filename: 'test.mp4',
      contentType: 'video/mp4',
    });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message, response: err.response?.data };
  }
}

