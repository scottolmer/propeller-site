# Ad attribution contract

The marketing site keeps first-touch and last non-direct-touch acquisition data
for 90 days. Same-site navigation and later direct visits retain the existing
last touch and do not extend that window. A new explicit campaign, advertising
click ID, or external referral replaces last touch; first touch stays immutable
until the stored record expires.

Links to web signup carry the first- and last-touch records as `pp_ft_*` and
`pp_lt_*` query parameters for the app to validate and persist. GA click events
receive only source, medium, campaign, and content. Click IDs and the `pp_*`
handoff fields are removed from GA event URLs.

`app_store_click` and `play_store_click` show which campaign sent someone to a
store. They do not prove an install, native account, trial, or payment. The
website cannot recover attribution after an App Store or Play Store handoff by
itself. Native-install attribution requires an app-side implementation and its
own privacy review. Until that exists, ad flows that need account-level
measurement should use web signup as their primary conversion path; the mobile
store links remain useful click-level signals.

Signup completion must be recorded after the account is created. Trial and paid
conversion events must come from durable backend lifecycle evidence and be
deduplicated with stable event or transaction IDs. No email address, name, or
other user-provided personal data belongs in GA event parameters.
