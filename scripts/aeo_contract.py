#!/usr/bin/env python3
"""Shared helpers for the versioned monthly AEO measurement contract."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "docs" / "seo" / "aeo-target-questions.json"
CONTRACTS = ROOT / "docs" / "seo" / "aeo-contracts"


def load_contract() -> dict:
    return json.loads(TARGETS.read_text(encoding="utf-8"))


def contract_payload(config: dict) -> dict:
    instructions = config["measurement_instructions"]
    return {
        "contract_version": config["contract_version"],
        "platforms": instructions["platforms"],
        "platform_modes": instructions["platform_modes"],
        "runs_per_prompt": instructions["runs_per_prompt"],
        "source_type_values": instructions["source_type_values"],
        "target_questions": [
            {
                "id": target["id"],
                "priority": target["priority"],
                "intent": target["intent"],
                "question": target["question"],
                "owned_url": target["owned_url"],
            }
            for target in config["target_questions"]
        ],
    }


def contract_hash(config: dict) -> str:
    encoded = json.dumps(
        contract_payload(config),
        ensure_ascii=True,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def archived_contract(config: dict) -> Path:
    return CONTRACTS / f"{config['contract_version']}.json"


def assert_archived_contract(config: dict) -> None:
    archive = archived_contract(config)
    if not archive.exists():
        raise ValueError(f"missing frozen contract archive: {archive.relative_to(ROOT)}")
    archived = json.loads(archive.read_text(encoding="utf-8"))
    if contract_hash(archived) != contract_hash(config):
        raise ValueError(f"active contract differs from frozen archive: {archive.relative_to(ROOT)}")


def load_archived_contract(version: str) -> dict:
    archive = CONTRACTS / f"{version}.json"
    if not archive.exists():
        raise ValueError(f"unknown contract version: {version}")
    return json.loads(archive.read_text(encoding="utf-8"))


def normalized_domain(value: str) -> str:
    candidate = value.strip()
    if not candidate:
        return ""
    if "://" not in candidate:
        candidate = f"https://{candidate}"
    try:
        return (urlparse(candidate).hostname or "").lower().removeprefix("www.")
    except ValueError:
        return ""


def is_domain(domain: str, root: str) -> bool:
    normalized = normalized_domain(domain)
    canonical_root = normalized_domain(root)
    return bool(normalized and canonical_root) and (
        normalized == canonical_root or normalized.endswith(f".{canonical_root}")
    )
