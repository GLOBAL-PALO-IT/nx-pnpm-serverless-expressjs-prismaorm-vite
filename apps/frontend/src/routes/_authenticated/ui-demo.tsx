import { createFileRoute } from '@tanstack/react-router';
import { ExampleUIDemo } from '../../components/ExampleUIDemo';

export const Route = createFileRoute('/_authenticated/ui-demo')({
  component: ExampleUIDemo,
});
