var data = {
    "drip": 0,
    "type": "multiple",
    "i18n": "dojo.student_questions:questions.which_word_best_describes_you?",
    "text": "Which word best describes you?",
    "_id": "5226aac8d709c7554a00000a",
    "__v": 0,
    "comment": [],
    "tags": [],
    "categories": [
      "feed"
    ],
    "opts": [
      {
        "image": "5E5SW3euRb6dMSpZVY5S_persistence.png",
        "i18n": "dojo.student_questions:options.persistence",
        "search": "persistence",
        "text": "Persistence",
        "_id": "5226aa3ed709c7554a000007",
        "__v": 0,
        "tags": []
      },
      {
        "image": "nY5qngyyQ8iqSOIHNmya_creative.png",
        "i18n": "dojo.student_questions:options.creative",
        "search": "creative",
        "text": "Creative",
        "_id": "5226aa5bd709c7554a000008",
        "__v": 0,
        "tags": []
      },
      {
        "image": "ajgSbr5LSPKkAx4WA1hB_clever.png",
        "i18n": "dojo.student_questions:options.clever",
        "search": "clever",
        "text": "Clever",
        "_id": "5226aa73d709c7554a000009",
        "__v": 0,
        "tags": []
      }
    ]
}
var linen = require(".."),
l = linen();

l.schema("question", {
    i18n: "string",
    text: "string",
    opts: [{ $ref: "questionChoice" }]
});

l.schema("questionChoice", {
    image: "string",
    i18n: "string",
    search: "string",
    text: "string",
    tagss: ["string"]
})

l.model("question", data)

