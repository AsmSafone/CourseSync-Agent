from typing import Dict, List
from datetime import datetime
from rich.table import Table
from rich.panel import Panel
from rich import box
from rich.prompt import Prompt

from .agent import CourseSyncAgent
from .utils import console


class CourseSyncCLI:
    """Beautiful CLI Interface for CourseSync"""

    def __init__(self):
        self.agent = CourseSyncAgent()
        self.courses = []
        self.all_assignments = []

    def show_banner(self):
        """Display welcome banner"""
        banner = """
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ██████╗ ██████╗ ██╗   ██╗██████╗ ███████╗███████╗  ║
║  ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝  ║
║  ██║     ██║   ██║██║   ██║██████╔╝███████╗█████╗    ║
║  ██║     ██║   ██║██║   ██║██╔══██╗╚════██║██╔══╝    ║
║  ╚██████╗╚██████╔╝╚██████╔╝██║  ██║███████║███████╗  ║
║   ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝  ║
║                                                       ║
║        Smart Deadline & Workload Balancer 🎓         ║
║                  Powered by AI                        ║
╚═══════════════════════════════════════════════════════╝
        """
        console.print(banner, style="bold cyan")
        console.print("\n[dim]Making campus life smarter, one deadline at a time.[/dim]\n")

    def main_menu(self):
        """Display main menu"""
        while True:
            console.print("\n[bold cyan]═══ Main Menu ═══[/bold cyan]\n")

            menu = Table(show_header=False, box=box.SIMPLE)
            menu.add_column("Option", style="cyan")
            menu.add_column("Description", style="white")

            menu.add_row("1", "📄 Add Course Syllabus (Text)")
            menu.add_row("2", "🌐 Scrape Course Page (URL)")
            menu.add_row("3", "📊 Analyze Workload")
            menu.add_row("4", "📅 Generate Study Schedule")
            menu.add_row("5", "🔔 View Smart Notifications")
            menu.add_row("6", "📋 View All Assignments")
            menu.add_row("7", "💾 Save Data")
            menu.add_row("8", "🚪 Exit")

            console.print(menu)

            choice = Prompt.ask("\n[bold yellow]Select option[/bold yellow]", choices=["1", "2", "3", "4", "5", "6", "7", "8"])

            if choice == "1":
                self.add_syllabus_text()
            elif choice == "2":
                self.scrape_course_url()
            elif choice == "3":
                self.show_workload_analysis()
            elif choice == "4":
                self.show_schedule()
            elif choice == "5":
                self.show_notifications()
            elif choice == "6":
                self.show_assignments()
            elif choice == "7":
                self.save_data()
            elif choice == "8":
                console.print("\n[bold green]👋 Stay organized! See you soon![/bold green]\n")
                break

    def add_syllabus_text(self):
        """Add syllabus via text input"""
        console.print("\n[bold cyan]📄 Add Course Syllabus[/bold cyan]")
        console.print("[dim]Paste your syllabus content (press Ctrl+D or Ctrl+Z when done):[/dim]\n")

        lines = []
        try:
            while True:
                line = input()
                lines.append(line)
        except EOFError:
            pass

        syllabus_text = "\n".join(lines)

        if not syllabus_text.strip():
            console.print("[yellow]⚠️  No content provided.[/yellow]")
            return

        semester_start = Prompt.ask("\n[yellow]Semester start date[/yellow]", default="2025-09-01")

        course_data = self.agent.parse_syllabus(syllabus_text, semester_start)

        if course_data and "assignments" in course_data:
            self.courses.append(course_data)
            self.all_assignments.extend(course_data["assignments"])

            console.print(f"\n[green]✅ Added {course_data.get('course_name', 'course')} with {len(course_data['assignments'])} assignments![/green]")
            self.display_course_summary(course_data)
        else:
            console.print("[red]❌ Failed to parse syllabus.[/red]")

    def scrape_course_url(self):
        """Scrape course page from URL"""
        console.print("\n[bold cyan]🌐 Scrape Course Page[/bold cyan]")
        url = Prompt.ask("[yellow]Enter course webpage URL[/yellow]")

        content = self.agent.scrape_course_page(url)

        if content:
            semester_start = Prompt.ask("\n[yellow]Semester start date[/yellow]", default="2025-09-01")
            course_data = self.agent.parse_syllabus(content, semester_start)

            if course_data and "assignments" in course_data:
                self.courses.append(course_data)
                self.all_assignments.extend(course_data["assignments"])
                console.print(f"\n[green]✅ Scraped and parsed {course_data.get('course_name', 'course')}![/green]")
                self.display_course_summary(course_data)
            else:
                console.print("[red]❌ Failed to parse scraped content.[/red]")
        else:
            console.print("[yellow]⚠️  Scraping failed. Try manual input instead.[/yellow]")

    def display_course_summary(self, course_data: Dict):
        """Display course summary"""
        panel = Panel(
            f"[bold]{course_data.get('course_name', 'Unknown')}[/bold]\n"
            f"Code: {course_data.get('course_code', 'N/A')}\n"
            f"Instructor: {course_data.get('instructor', 'N/A')}\n"
            f"Assignments: {len(course_data.get('assignments', []))}",
            title="📚 Course Summary",
            border_style="green",
        )
        console.print(panel)

    def show_assignments(self):
        """Display all assignments"""
        if not self.all_assignments:
            console.print("\n[yellow]📋 No assignments yet. Add a course first![/yellow]")
            return

        console.print(f"\n[bold cyan]📋 All Assignments ({len(self.all_assignments)})[/bold cyan]\n")

        table = Table(title="Assignment Overview", box=box.ROUNDED)
        table.add_column("Course", style="cyan")
        table.add_column("Assignment", style="white")
        table.add_column("Type", style="yellow")
        table.add_column("Due Date", style="magenta")
        table.add_column("Weight", style="green")
        table.add_column("Hours", style="blue")

        for assignment in sorted(self.all_assignments, key=lambda x: x.get("due_date", "")):
            table.add_row(
                assignment.get("course", "N/A"),
                assignment.get("name", ""),
                assignment.get("type", ""),
                assignment.get("due_date", ""),
                f"{assignment.get('weight', 0)}%",
                f"{assignment.get('estimated_hours', 0)}h",
            )

        console.print(table)

    def show_workload_analysis(self):
        """Display workload analysis"""
        if not self.all_assignments:
            console.print("\n[yellow]⚠️  No assignments to analyze. Add courses first![/yellow]")
            return

        console.print("\n[bold cyan]📊 Workload Analysis[/bold cyan]\n")

        analysis = self.agent.analyze_workload(self.all_assignments)

        if not analysis:
            console.print("[red]❌ Analysis failed.[/red]")
            return

        # Summary Panel
        summary = Panel(
            f"[bold]Total Study Hours:[/bold] {analysis.get('total_hours', 0)}h\n"
            f"[bold]Risk Weeks:[/bold] {len(analysis.get('risk_weeks', []))}\n"
            f"[bold]Priority Assignments:[/bold] {len(analysis.get('priority_assignments', []))}",
            title="📈 Summary",
            border_style="cyan",
        )
        console.print(summary)

        # Weekly Breakdown
        if "weekly_breakdown" in analysis:
            console.print("\n[bold]Weekly Hour Distribution:[/bold]")
            breakdown_table = Table(box=box.SIMPLE)
            breakdown_table.add_column("Week", style="cyan")
            breakdown_table.add_column("Hours", style="yellow")
            breakdown_table.add_column("Status", style="white")

            for week, hours in analysis["weekly_breakdown"].items():
                status = "🔴 HIGH RISK" if hours > 20 else "🟢 Normal" if hours < 15 else "🟡 Moderate"
                breakdown_table.add_row(week, f"{hours}h", status)

            console.print(breakdown_table)

        # Recommendations
        if analysis.get("recommendations"):
            console.print("\n[bold yellow]💡 Recommendations:[/bold yellow]")
            for i, rec in enumerate(analysis["recommendations"], 1):
                console.print(f"  {i}. {rec}")

    def show_schedule(self):
        """Display study schedule"""
        if not self.all_assignments:
            console.print("\n[yellow]⚠️  No assignments to schedule. Add courses first![/yellow]")
            return

        hours_per_day = int(Prompt.ask("\n[yellow]Study hours per day[/yellow]", default="4"))

        console.print("\n[bold cyan]📅 Generating Your Study Schedule[/bold cyan]\n")

        schedule = self.agent.create_schedule(self.all_assignments, hours_per_day)

        if not schedule or "daily_schedule" not in schedule:
            console.print("[red]❌ Schedule generation failed.[/red]")
            return

        # Display daily schedule
        for date in sorted(schedule["daily_schedule"].keys())[:14]:  # Show 2 weeks
            tasks = schedule["daily_schedule"][date]

            if not tasks:
                continue

            total_hours = sum(t.get("hours", 0) for t in tasks)

            console.print(f"\n[bold cyan]📆 {date}[/bold cyan] [dim]({total_hours}h total)[/dim]")

            for task in tasks:
                priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get("priority", "low"), "⚪")
                console.print(f"  {priority_icon} {task.get('task', '')} [dim]({task.get('hours', 0)}h)[/dim]")
                console.print(f"     [dim]→ {task.get('assignment', '')}[/dim]")

        # Warnings
        if schedule.get("warnings"):
            console.print("\n[bold red]⚠️  Warnings:[/bold red]")
            for warning in schedule["warnings"]:
                console.print(f"  • {warning}")

    def show_notifications(self):
        """Display smart notifications"""
        if not self.all_assignments:
            console.print("\n[yellow]⚠️  No assignments to notify about. Add courses first![/yellow]")
            return

        console.print("\n[bold cyan]🔔 Generating Smart Notifications[/bold cyan]\n")

        schedule = self.agent.create_schedule(self.all_assignments)
        notifications = self.agent.generate_notifications(schedule, self.all_assignments)

        if not notifications:
            console.print("[yellow]No notifications generated.[/yellow]")
            return

        for notif in notifications[:10]:  # Show top 10
            urgency_style = {
                "high": "bold red",
                "medium": "bold yellow",
                "low": "dim white",
            }.get(notif.get("urgency", "low"), "white")

            urgency_icon = {
                "high": "🚨",
                "medium": "⚡",
                "low": "ℹ️",
            }.get(notif.get("urgency", "low"), "📢")

            panel = Panel(
                f"[{urgency_style}]{notif.get('message', '')}[/{urgency_style}]\n\n"
                f"[bold]Action:[/bold] {notif.get('action', '')}\n"
                f"[dim]Send at: {notif.get('send_at', '')}[/dim]",
                title=f"{urgency_icon} {notif.get('type', 'notification').upper()}",
                border_style=urgency_style.split()[0] if " " in urgency_style else urgency_style,
            )
            console.print(panel)
            console.print()

    def save_data(self):
        """Save all data to file"""
        if not self.courses:
            console.print("\n[yellow]⚠️  No data to save.[/yellow]")
            return

        data = {
            "timestamp": datetime.now().isoformat(),
            "courses": self.courses,
            "total_assignments": len(self.all_assignments),
        }

        filename = f"coursesync_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, "w") as f:
            import json

            json.dump(data, f, indent=2)

        console.print(f"\n[green]✅ Data saved to {filename}[/green]")

    def run(self):
        """Run the CLI application"""
        self.show_banner()

        # Load environment keys (clients reads os.environ at import time). If keys are missing
        # we warn the user but continue so the CLI stays interactive instead of exiting.
        from .clients import GROQ_API_KEY, FIRECRAWL_API_KEY

        if not GROQ_API_KEY:
            console.print("[yellow]⚠️  GROQ_API_KEY not set! Some AI features will be disabled. Add it to a .env or set the GROQ_API_KEY environment variable.[/yellow]")

        if not FIRECRAWL_API_KEY:
            console.print("[yellow]⚠️  FIRECRAWL_API_KEY not set (optional). Some scraping features may be limited.[/yellow]")

        # Proceed to the interactive menu even if API keys are missing.
        self.main_menu()


def run_cli():
    cli = CourseSyncCLI()
    cli.run()
