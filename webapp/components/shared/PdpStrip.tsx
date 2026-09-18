// A minimal, tasteful nod to the PDP umbrella's green/white/red — a 4px
// tricolor strip used at the top of every page header. Not a logo
// reproduction, just an accent that reads as "this is a PDP-branded build"
// without competing with the module color-coding used everywhere else.
export default function PdpStrip() {
  return (
    <div className="mb-0.5 flex h-1 overflow-hidden rounded-full" aria-hidden="true">
      <div className="flex-1 bg-co-green" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-red-600" />
    </div>
  );
}
