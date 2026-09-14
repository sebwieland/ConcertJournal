package com.ConcertJournalAPI.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // "/" has no path segment, so it does not match the {path} pattern below —
    // map it explicitly so the unified container serves the SPA at the domain
    // root instead of a Whitelabel 404. The two-segment mapping covers React
    // Router path-param routes like /edit-entry/11.
    @RequestMapping(value = {"/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/{subPath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
