<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## VTweaks architecture
- Keep public content in separate TanStack leaf routes with unique metadata; shared chrome lives around the root Outlet for navigable, indexable pages.
- Use a lazily initialized browser Supabase client against the owner's external project only; account and admin authorization rely on existing authenticated RPCs, never client metadata.
- Keep Windows task demos explicitly illustrative and disconnected from system operations; Electron delivery is additive scoped CSS plus preserved markup, with no IPC or backend implementation.
- Keep product catalog and retained guides in a browser-safe data module; all animation lifecycle work runs in effects with reduced-motion and visibility cleanup.
- Validate account inputs with shared Zod schemas and exercise Auth/RPC flows only against mocked network responses during agent testing to avoid customer access and email sends.

