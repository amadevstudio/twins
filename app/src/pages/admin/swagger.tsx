import dynamic from "next/dynamic";
import 'swagger-ui-react/swagger-ui.css';

// TODO: create it's own layout

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function Swagger() {
  return (
    <SwaggerUI url="/api/openapi.json" />
  )
}
