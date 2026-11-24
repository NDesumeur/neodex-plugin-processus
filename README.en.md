# Processus (Processes)

A simple task manager inside NeoDex: the programs running on your PC, grouped by name, with their share of the processor and their memory, refreshed every 2 seconds. It also shows what each NeoDex plugin uses.

*Version française : [README.md](README.md)*

## Every process explained (new in 1.2.0)

A plain sentence under each program: what is part of Windows and must not be closed, what is safe, drivers, and fake Windows names to have checked. « Hide Windows » box.

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

## Every process explained (1.2.0)

Under each program’s name, a sentence says what it does, with a tag:

- **WINDOWS · do not close**: a part of Windows (svchost, csrss, lsass, dwm…). Many svchost processes are normal.
- **WINDOWS · safe, it restarts**: for example Explorer or Start menu search.
- **DRIVER**: graphics card, sound, USB.
- **CHECK IT**: a Windows name started outside the Windows folder, or a program started from a temporary folder. Have your antivirus scan the file.

For an unknown program, the file path stays shown. The **Hide Windows** box keeps only your programs. The filter also searches the explanations.
