import { json } from '@remix-run/cloudflare';
import { default as IndexRoute } from './_index';
export async function loader(args) {
    return json({ id: args.params.id });
}
export default IndexRoute;
