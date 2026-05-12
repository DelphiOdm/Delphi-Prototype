# # # #context_builder.py
# # from .intent_analyzer import analyze_intent
# # from .taxonomy_matcher import match_taxonomy_value


# # def build_context(user_input, existing_context):

# #     # -----------------------------
# #     # GPT EXTRACTION
# #     # -----------------------------
# #     extracted = analyze_intent(user_input)

# #     # -----------------------------
# #     # DIRECT TAXONOMY MATCH
# #     # -----------------------------
# #     taxonomy_data = match_taxonomy_value(user_input)

# #     # merge taxonomy values
# #     extracted.update(taxonomy_data)

# #     # -----------------------------
# #     # SAVE ONLY VALID VALUES
# #     # -----------------------------
# #     for k, v in extracted.items():

# #         if v:
# #             existing_context[k] = v

# #     return existing_context


# # context_builder.py
# from .intent_analyzer import analyze_intent
# from .taxonomy_matcher import match_taxonomy_value


# def build_context(user_input: str, existing_context: dict) -> dict:
#     """
#     Merge extracted intent + taxonomy matches into existing context.
#     Taxonomy match takes priority over LLM extraction for taxonomy fields.
#     """
#     # Step 1: GPT extraction (broad NLP understanding)
#     extracted = analyze_intent(user_input)

#     # Step 2: Direct taxonomy match (precise DB-backed values)
#     taxonomy_data = match_taxonomy_value(user_input)

#     # Step 3: Merge — taxonomy wins on conflicts (it's ground truth)
#     merged = {**extracted, **taxonomy_data}

#     # Step 4: Write only non-empty values into existing context
#     for k, v in merged.items():
#         if v and str(v).strip():
#             existing_context[k] = v

#     return existing_context


# context_builder.py
from .intent_analyzer import analyze_intent
from .taxonomy_matcher import match_taxonomy_value


def build_context(user_input: str, existing_context: dict) -> dict:
    """
    Merge extracted intent + taxonomy matches into existing context.
    Taxonomy match takes priority over LLM extraction for taxonomy fields.
    """
    # Step 1: GPT extraction (broad NLP understanding)
    extracted = analyze_intent(user_input)

    # Step 2: Direct taxonomy match (precise DB-backed values)
    taxonomy_data = match_taxonomy_value(user_input)

    # Step 3: Merge — taxonomy wins on conflicts (it's ground truth)
    merged = {**extracted, **taxonomy_data}

    # Step 4: Write only non-empty values into existing context
    for k, v in merged.items():
        if v and str(v).strip():
            existing_context[k] = v

    return existing_context