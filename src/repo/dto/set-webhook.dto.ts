export class CreateWebHookDto {
  name: string;
  active: boolean;
  events: string[];
  config: {
    url: string;
    content_type: string;
    insecure_ssl: string;
  };
}
