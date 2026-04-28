#!/bin/sh
# intent-kit: PreToolUse:Skill hook
#
# When the model invokes a brainstorming/planning skill from a known harness
# (e.g. superpowers:brainstorming, superpowers:writing-plans), inject the
# IDD workflow rules so the agent captures intent.md first.
#
# Matches:
#   superpowers:brainstorming, superpowers:writing-plans,
#   superpowers:executing-plans, superpowers:subagent-driven-development
# Other skills are passed through unchanged.

set -eu

input=$(cat)
skill=$(printf '%s' "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null || echo "")

base="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/intent-kit/overrides"
[ -d "$base" ] || exit 0

case "$skill" in
  superpowers:brainstorming|superpowers:writing-plans|superpowers:executing-plans|superpowers:subagent-driven-development)
    name=${skill#superpowers:}
    common="$base/_common.md"
    override="$base/${name}.md"
    tmp=$(mktemp)
    [ -f "$common" ] && cat "$common" >> "$tmp"
    if [ -f "$override" ]; then
      [ -s "$tmp" ] && printf '\n' >> "$tmp"
      cat "$override" >> "$tmp"
    fi
    if [ -s "$tmp" ]; then
      jq -n --rawfile ctx "$tmp" \
        '{hookSpecificOutput: {hookEventName: "PreToolUse", additionalContext: $ctx}}'
    fi
    rm -f "$tmp"
    ;;
esac

exit 0
