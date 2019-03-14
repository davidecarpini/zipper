import * as convict from 'convict';

export default convict({
  port: {
    default: '3000',
    format: 'port',
    env: 'PORT'
  },
  outputFolder: {
    default: '/../temp/',
    format: String,
    env: 'OUTPUT_FOLDER'
  }
})
