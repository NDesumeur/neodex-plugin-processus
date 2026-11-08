# Processus (Processes)

A simple task manager inside NeoDex: the programs running on your PC, grouped by name, with their share of the processor and their memory, refreshed every 2 seconds. It also shows what each NeoDex plugin uses.

*Version française : [README.md](README.md)*

## Programs

- Each row groups all the processes of one program (for example all of a browser's), with the **processor** used (in %) and the **memory** (in MB or GB).
- **Filter**: shows only programs whose name contains what you type.
- **Sort** by processor, by memory or by name.
- **Close** forces the program to close, like "End task" in the Windows Task Manager, after confirmation: anything unsaved in that program is lost.
- Programs Windows cannot do without are protected: closing them could freeze the PC. If some processes refuse to close (administrator rights would be needed), the plugin says so.

## NeoDex plugins

The **NeoDex plugins** section lists each open plugin:

- its processor and memory use;
- what it has downloaded since NeoDex started (number of requests and volume) and its size on disk;
- **Stop** unloads it: it frees its memory and starts again when you reopen it.

Several plugins can share the same process; a plugin that runs inside NeoDex itself cannot be stopped here (disable it in the NeoStore instead).

## Data and sync

Nothing is synced: the plugin keeps no data.

## Install

In NeoDex: **NeoStore → Discover → Processus → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
