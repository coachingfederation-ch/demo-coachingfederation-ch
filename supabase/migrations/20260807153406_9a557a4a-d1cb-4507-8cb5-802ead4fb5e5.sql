REVOKE ALL ON FUNCTION public.tg_articles_publish_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_article_publisher(uuid) FROM PUBLIC, anon, authenticated;