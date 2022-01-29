# Why create trigger for each view collection (`onViewSrcCreated`), instead of creating one for each data collection?
Pros:
- Able to configure each trigger (memory, timeout, etc.) more precisely
- Errors thrown on creation of a view does not affect creation of another views
Cons:
- May hit 1000 trigger limit per region if the spec has a lot of collections
  and views

# What are `k` and `n`?

The letter `k` in trigger name stands for O(k), it means number of document
operated in the trigger can be calculated by looking at the spec. For example,
we can count number of view document created when a data document created.

The letter `n` in trigger name stands for O(n), it means number of document
operated in the trigger can't be calculated by looking at the spec. For example,
we only know number of affected document on runtime when data document changed.