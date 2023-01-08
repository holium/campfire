::::  A minimal .wav (audio file) mark. Needed for globbing the frontend. Based on base/mar/png.hoon
|_  dat=@
++  grow
  |%
  ++  mime  [/audio/wav (as-octs:mimes:html dat)]
  --
++  grab
  |%
  ++  mime  |=([p=mite q=octs] q.q)
  ++  noun  @
  --
++  grad  %mime
--
