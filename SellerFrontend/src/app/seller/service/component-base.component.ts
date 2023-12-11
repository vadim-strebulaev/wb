import { Component, Directive, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class ComponentBase implements OnDestroy, OnInit {
    protected destroyed = new Subject<void>();

    abstract ngOnInit(): void;

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }
}
