import { createFileRoute } from '@tanstack/react-router';
import { PostsPage } from '../../pages/PostsPage';

export const Route = createFileRoute('/_authenticated/posts')({
  component: PostsPage,
});
