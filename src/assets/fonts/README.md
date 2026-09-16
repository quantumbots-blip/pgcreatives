# Poppins

The two weights the share cards set, and the licence they ship under.

Poppins is the site's typeface, loaded in the browser through `next/font/google`.
Satori cannot reach that: it renders the cards on the server with no network and
no CSS font loading, and it needs the actual font bytes handed to it. It also
cannot read WOFF2, which is all the `next/font` cache holds. So these are the
TrueType originals from the upstream Google Fonts repository.

Only Bold (700) for the display line and Medium (500) for the meta line are
here. Regular and SemiBold were committed first and then removed: nothing set
them, and each one is another 155KB in the repository and another face parsed on
every build.

Poppins is licensed under the SIL Open Font License 1.1. `OFL.txt` is the
licence, kept alongside the fonts as it requires.
