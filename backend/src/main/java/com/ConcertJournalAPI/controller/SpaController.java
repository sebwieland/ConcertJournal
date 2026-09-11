package com.ConcertJournalAPI.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // "/" has no path segment, so it does not match the {path} pattern below —
    // map it explicitly so the unified container serves the SPA at the domain
    // root instead of a Whitelabel 404.
    @RequestMapping(value = {"/", "/{path:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
