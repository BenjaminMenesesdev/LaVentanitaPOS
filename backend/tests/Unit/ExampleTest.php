<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Sanity check para asegurar que la suite "Unit" siempre tenga al
     * menos un test ejecutable (paratest falla si el directorio está vacío).
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
