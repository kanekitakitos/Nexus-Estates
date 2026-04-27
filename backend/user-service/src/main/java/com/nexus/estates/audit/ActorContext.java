package com.nexus.estates.audit;

import java.util.Optional;

public final class ActorContext {
    private static final ThreadLocal<Actor> CURRENT = new ThreadLocal<>();

    private ActorContext() {
    }

    public static void set(Actor actor) {
        CURRENT.set(actor);
    }

    public static Optional<Actor> get() {
        return Optional.ofNullable(CURRENT.get());
    }

    public static void clear() {
        CURRENT.remove();
    }

    public record Actor(Long userId, String email) {
    }
}
